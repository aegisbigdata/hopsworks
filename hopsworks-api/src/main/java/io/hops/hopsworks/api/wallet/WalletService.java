/*
 * This file is part of Hopsworks
 * Copyright (C) 2018, Logical Clocks AB. All rights reserved
 *
 * Hopsworks is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * Hopsworks is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 *
 */
package io.hops.hopsworks.api.wallet;

import io.hops.hopsworks.api.filter.AllowedProjectRoles;
import io.hops.hopsworks.api.filter.Audience;
import io.hops.hopsworks.api.filter.NoCacheResponse;
import io.hops.hopsworks.api.util.RESTApiJsonResponse;
import io.hops.hopsworks.common.dao.dataset.Dataset;
import io.hops.hopsworks.common.dao.dataset.DatasetFacade;
import io.hops.hopsworks.common.dao.hdfs.inode.Inode;
import io.hops.hopsworks.common.dao.hdfs.inode.InodeFacade;
import io.hops.hopsworks.common.dao.project.Project;
import io.hops.hopsworks.common.dao.project.ProjectFacade;
import io.hops.hopsworks.common.exception.RESTCodes;
import io.hops.hopsworks.common.exception.WalletException;
import io.hops.hopsworks.common.util.ClientWrapper;
import io.hops.hopsworks.jwt.annotation.JWTRequired;
import io.swagger.annotations.Api;
import java.util.logging.Level;
import javax.ejb.EJB;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.enterprise.context.RequestScoped;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Api(value = "Wallet Service",
  description = "Wallet Service")
@TransactionAttribute(TransactionAttributeType.NEVER)
public class WalletService {
  @EJB
  private NoCacheResponse noCacheResponse;
  @EJB
  private InodeFacade inodeFacade;
  @EJB
  private DatasetFacade datasetFacade;
  @EJB
  private ProjectFacade projectFacade;
  
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @AllowedProjectRoles({AllowedProjectRoles.DATA_OWNER})
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response share(DatasetJSON datasetJSON) throws WalletException {
    Project project = getProjectByName(datasetJSON.projectName);
    Inode datasetInode = getInode(datasetJSON.datasetInodeId);
    Dataset dataset = getDatasetByInode(project, datasetInode);
    
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpInstance(WalletServerJSONResult.class)
      .setTarget("http://localhost:30000").setPath("wallet/mypath").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    
    RESTApiJsonResponse json = new RESTApiJsonResponse();
    json.setSuccessMessage("Dataset shared on wallet");
    return successResponse(json);
  }
  
  public static class DatasetJSON{
    String projectName;
    long datasetInodeId;

    public String getProjectName() {
      return projectName;
    }

    public void setProjectName(String projectName) {
      this.projectName = projectName;
    }

    public long getDatasetInodeId() {
      return datasetInodeId;
    }

    public void setDatasetInodeId(long datasetInodeId) {
      this.datasetInodeId = datasetInodeId;
    }
  }
  
  public static class WalletServerJSONResult {
  }
  
  private Project getProjectByName(String name) throws WalletException {
    Project project = projectFacade.findByName(name);
    if (project == null) {
      throw new WalletException(RESTCodes.WalletErrorCode.FILE_NOT_FOUND, Level.FINE, "project does not exist", 
        "project with this name does not exist");
    }
    return project;
  }
  
  private Inode getInode(Long inodeId) throws WalletException {
    if (inodeId == null) {
      throw new WalletException(RESTCodes.WalletErrorCode.FILE_NOT_FOUND, Level.FINE, "file does not exist",
        "inodeId does not exist");
    }
    return inodeFacade.findById(inodeId);
  }
  
  private Dataset getDatasetByInode(Project project, Inode inode) throws WalletException {
    Dataset dataset = datasetFacade.findByProjectAndInode(project, inode);
    if (dataset == null) {
      throw new WalletException(RESTCodes.WalletErrorCode.FILE_NOT_FOUND, Level.FINE, "dataset does not exist", 
        "dataset with this project and inode does not exist");
    }
    return dataset;
  }
  
  private Response successResponse(Object content) {
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK).entity(content).build();
  }
}
