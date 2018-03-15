package io.hops.hopsworks.api.test;

import io.hops.hopsworks.api.filter.JWTTokenNeeded;
import io.hops.hopsworks.api.filter.NoCacheResponse;
import java.util.logging.Logger;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/test")
@Produces(MediaType.TEXT_PLAIN)
@Stateless
@TransactionAttribute(TransactionAttributeType.NEVER)
public class TestService {
  
  @EJB
  private NoCacheResponse noCacheResponse;
  
  private final static Logger logger = Logger.getLogger(TestService.class.getName());
  
  @GET
  @Path("jwt")
  @JWTTokenNeeded
  public Response echoWithJWTToken() {
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK).entity("OK").build();
  }
}
