package io.hops.hopsworks.api.test;

import io.hops.hopsworks.api.filter.NoCacheResponse;
import java.util.logging.Logger;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import io.hops.hopsworks.api.filter.JWTokenNeeded;

@Path("/test")
@Stateless
@TransactionAttribute(TransactionAttributeType.NEVER)
public class TestService {
  
  @EJB
  private NoCacheResponse noCacheResponse;
  
  private final static Logger logger = Logger.getLogger(TestService.class.getName());
  
  @GET
  @Path("/jwt")
  @JWTokenNeeded
  public Response echoWithJWTToken(@Context SecurityContext sc) {
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK)
            .entity(sc.getAuthenticationScheme()).build();
  }
}
