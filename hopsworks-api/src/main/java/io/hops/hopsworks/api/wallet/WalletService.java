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
import java.net.URLEncoder;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
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

  public static final String HYPERLEDGER_URL = "https://localhost:3001";

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @AllowedProjectRoles({AllowedProjectRoles.DATA_OWNER})
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response share(DatasetJSON datasetJSON) throws WalletException {
    Project project = getProjectByName(datasetJSON.projectName);
    Inode datasetInode = getInode(datasetJSON.datasetInodeId);
    Dataset dataset = getDatasetByInode(project, datasetInode);

    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
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

  public static class UserJSON {
    public String $class = "eu.aegis.User";
    public String uid;
    public float balance;
  }

  public static class AEGISAssetJSON {
    public String $class = "eu.aegis.AEGISAsset";
    public String aid;
    public String assetType;
    public float cost;
    public String status;
    public String owner;
  }

  public static class ContractJSON {
    public String $class = "eu.aegis.Contract";
    public String tid;
    public String exclusivity;
    public float amountPaid;
    public String status;
    public String text;
    public String seller;
    public String buyer;
    public String relatedAsset;
  }

  public static class ValidationJSON {
    public String contract;
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN"})
  public Response createUser(UserJSON user) throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User").setMediaType(MediaType.APPLICATION_JSON).setPayload(user);
    WalletServerJSONResult result = client.doPost();
    client.close();

    return successResponse(result);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getUsers() throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();

    return successResponse(result);
  }

  @GET
  @Path("{uid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getUser(@PathParam("uid") String uid) throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User/" + uid).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();

    return successResponse(result);
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response createAsset(AEGISAssetJSON asset) throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset").setMediaType(MediaType.APPLICATION_JSON).setPayload(asset);
    WalletServerJSONResult result = client.doPost();
    client.close();

    return successResponse(result);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getAssets() throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();

    return successResponse(result);
  }

  @GET
  @Path("{aid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getAsset(@PathParam("aid") String aid) throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset/" + aid).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();

    return successResponse(result);
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response createContract(ContractJSON contract) throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract").setMediaType(MediaType.APPLICATION_JSON).setPayload(contract);
    WalletServerJSONResult result = client.doPost();
    client.close();

    return successResponse(result);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getContracts() throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();

    return successResponse(result);
  }

  @GET
  @Path("{uid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getBuyContracts(@PathParam("uid") String uid) throws WalletException {
    String filter = URLEncoder.encode("{\"where\": {\"buyer\": {\"eq\": \"resource:eu.aegis.User#" + uid + "\"}}}");
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();

    return successResponse(result);
  }

  @GET
  @Path("{uid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getSellContracts(@PathParam("uid") String uid) throws WalletException {
    String filter = URLEncoder.encode("{\"where\": {\"seller\": {\"eq\": \"resource:eu.aegis.User#" + uid + "\"}}}");
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();

    return successResponse(result);
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response validateContract(ValidationJSON validation) throws WalletException {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON).setPayload(validation);
    WalletServerJSONResult result = client.doPost();
    client.close();

    return successResponse(result);
  }
}
