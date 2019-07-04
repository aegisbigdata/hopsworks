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
import io.hops.hopsworks.api.jwt.JWTHelper;
import io.hops.hopsworks.api.util.RESTApiJsonResponse;
import io.hops.hopsworks.common.dao.user.Users;
import io.hops.hopsworks.common.exception.WalletException;
import io.hops.hopsworks.common.wallet.WalletController;
import io.hops.hopsworks.jwt.annotation.JWTRequired;
import io.swagger.annotations.Api;
import javax.ejb.EJB;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.enterprise.context.RequestScoped;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

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
  private WalletController walletController;
  @EJB
  private JWTHelper jWTHelper;

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @AllowedProjectRoles({AllowedProjectRoles.DATA_OWNER})
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response share(WalletController.DatasetJSON datasetJSON, @Context SecurityContext sc) 
    throws WalletException {
    Users user = jWTHelper.getUserPrincipal(sc);
    walletController.shareDataset(datasetJSON, user);

    RESTApiJsonResponse json = new RESTApiJsonResponse();
    json.setSuccessMessage("Dataset shared on wallet");
    return successResponse(json);
  }

  private Response successResponse(Object content) {
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK).entity(content).build();
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getUsers() throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.getUsers();
    return successResponse(result);
  }

  @GET
  @Path("{uid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getUser(@PathParam("uid") String uid) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.getUser(uid);
    return successResponse(result);
  }
  
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN"})
  public Response createUser(WalletController.UserJSON user) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.createUser(user);
    return successResponse(result);
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response createAsset(WalletController.AEGISAssetJSON asset) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.createAsset(asset);
    return successResponse(result);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getAssets() throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.getAssets();
    return successResponse(result);
  }

  @GET
  @Path("{aid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getAsset(@PathParam("aid") String aid) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.getAsset(aid);
    return successResponse(result);
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response createContract(WalletController.ContractJSON contract) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.createContract(contract);
    return successResponse(result);
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getContracts() throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.getContracts();
    return successResponse(result);
  }

  @GET
  @Path("{uid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getBuyContracts(@PathParam("uid") String uid) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.getBuyContracts(uid);
    return successResponse(result);
  }

  @GET
  @Path("{uid}")
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response getSellContracts(@PathParam("uid") String uid) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.getSellContracts(uid);
    return successResponse(result);
  }

  @POST
  @Produces(MediaType.APPLICATION_JSON)
  @JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
  public Response validateContract(WalletController.ValidationJSON validation) throws WalletException {
    WalletController.WalletServerJSONResult result = walletController.validateContract(validation);
    return successResponse(result);
  }
}
