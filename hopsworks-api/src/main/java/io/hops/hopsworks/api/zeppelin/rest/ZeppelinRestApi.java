package io.hops.hopsworks.api.zeppelin.rest;

import io.hops.hopsworks.api.filter.AllowedProjectGroups;
import io.hops.hopsworks.api.zeppelin.server.JsonResponse;
import io.swagger.annotations.Api;
import javax.ejb.Stateless;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import org.apache.zeppelin.util.Util;
import io.hops.hopsworks.api.filter.JWTokenNeeded;

/**
 */
@Path("/zeppelin/{projectID}")
@Stateless
@Api(value = "Zeppelin",
        description = "Zeppelin Api")
public class ZeppelinRestApi {

  public ZeppelinRestApi() {
  }

  /**
   * Get the root endpoint Return always 200.
   * <p/>
   * @return 200 response
   */
  @GET
  @AllowedProjectGroups({AllowedProjectGroups.HOPS_ADMIN, AllowedProjectGroups.HOPS_USER})
  @JWTokenNeeded
  public Response getRoot() {
    return Response.ok().build();
  }

  @GET
  @Path("version")
  @AllowedProjectGroups({AllowedProjectGroups.HOPS_ADMIN, AllowedProjectGroups.HOPS_USER})
  @JWTokenNeeded
  public Response getVersion() {
    return new JsonResponse<>(Response.Status.OK, "Zeppelin version", Util.
            getVersion()).build();
  }
}
