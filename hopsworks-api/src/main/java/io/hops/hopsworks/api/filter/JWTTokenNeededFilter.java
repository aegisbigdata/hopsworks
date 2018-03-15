package io.hops.hopsworks.api.filter;

import java.util.logging.Logger;
import javax.annotation.Priority;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.ext.Provider;
import java.util.logging.Level;
import javax.ws.rs.core.Response;
import java.security.Key;
import io.jsonwebtoken.Jwts;
import javax.crypto.spec.SecretKeySpec;

@Provider
@JWTTokenNeeded
@Priority(Priorities.AUTHENTICATION)
public class JWTTokenNeededFilter implements ContainerRequestFilter {
    
  private final static Logger log = Logger.getLogger(JWTTokenNeededFilter.class.getName());
  
  @Override
  public void filter(ContainerRequestContext requestContext) {
    // Get the HTTP Authorization header from the request
    String authorizationHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
    log.log(Level.INFO, "#### authorizationHeader : {0}", authorizationHeader);

    // Check if the HTTP Authorization header is present and formatted correctly
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      log.log(Level.SEVERE, "#### invalid authorizationHeader : {0}",  authorizationHeader);
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
      
      return;
    }

    // Extract the token from the HTTP Authorization header
    String token = authorizationHeader.substring("Bearer".length()).trim();

    try {
      // Validate the token
      String keyString = "2adfj517dAHD828ASiw1";
      Key key = new SecretKeySpec(keyString.getBytes(), 0, keyString.getBytes().length, "DES");
      
      Jwts.parser().setSigningKey(key).parseClaimsJws(token);
      log.log(Level.INFO, "#### valid token {0}: ", token);
    } catch (Exception e) {
      log.log(Level.SEVERE, "#### invalid token : {0}", token);
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
    }
  }
}
