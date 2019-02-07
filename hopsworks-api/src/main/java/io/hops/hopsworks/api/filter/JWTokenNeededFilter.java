package io.hops.hopsworks.api.filter;

import io.hops.hopsworks.api.util.RESTApiJsonResponse;
import io.hops.hopsworks.common.dao.project.Project;
import io.hops.hopsworks.common.dao.project.ProjectFacade;
import io.hops.hopsworks.common.dao.project.team.ProjectTeamFacade;
import io.hops.hopsworks.common.dao.user.UserFacade;
import io.hops.hopsworks.common.dao.user.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
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
import java.lang.reflect.Method;
import java.security.Principal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.crypto.spec.SecretKeySpec;
import javax.ejb.EJB;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.SecurityContext;

@Provider
@JWTokenNeeded
@Priority(Priorities.AUTHENTICATION)
public class JWTokenNeededFilter implements ContainerRequestFilter {
  
  @EJB
  private ProjectTeamFacade projectTeamBean;

  @EJB
  private ProjectFacade projectBean;
  
  @EJB
  private UserFacade userFacade;

  @Context
  private ResourceInfo resourceInfo;
  
  private final static Logger log = Logger.getLogger(JWTokenNeededFilter.class.getName());
  
  @Override
  public void filter(ContainerRequestContext requestContext) {
    
    String path = requestContext.getUriInfo().getPath();
    Method method = resourceInfo.getResourceMethod();
    String[] pathParts = path.split("/");
    log.log(Level.FINEST, "Rest call to {0}.", new Object[]{path});
    log.log(Level.FINEST, "Filtering request path: {0}", pathParts[0]);
    log.log(Level.FINEST, "Method called: {0}", method.getName());
    
    // JWT interception
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

      Jws<Claims> claims = Jwts.parser().setSigningKey(key).parseClaimsJws(token);
      log.log(Level.INFO, "#### valid token {0}: ", token);
      
      if (claims.getBody().getSubject() == null) {
        requestContext.abortWith(Response.
                status(Response.Status.UNAUTHORIZED).build());
        return;
      }
        
      //if the resource is only allowed for some roles check if the user have the requierd role for the resource.
      String userEmail = claims.getBody().getSubject();
      Users user = this.userFacade.findByEmail(userEmail);
      List<String> bbcGroups = claims.getBody().get("bbc", List.class);
      
      requestContext.setSecurityContext(new SecurityContext() {
        @Override
        public Principal getUserPrincipal() {
          return new Principal() {
              @Override
              public String getName() {
                return userEmail;
              }
          };
        }
        @Override
        public boolean isUserInRole(String role) {
          return bbcGroups.contains(role);
        }
        @Override
        public boolean isSecure() {
          return requestContext.getUriInfo().getAbsolutePath().toString().startsWith("https");
        }
        @Override
        public String getAuthenticationScheme() {
          return "Token-Based-Auth-Scheme";
        }
      });
      
      if (method.isAnnotationPresent(AllowedProjectGroups.class)) {
        AllowedProjectGroups groupsAnnotation = method.getAnnotation(AllowedProjectGroups.class);
        Set<String> groupSet;
        groupSet = new HashSet<>(Arrays.asList(groupsAnnotation.value()));

        boolean contains = false;
        for (String bbcRole: bbcGroups) {
          if (groupSet.contains(bbcRole)) {
            contains = true;
            break;
          }
        }

        if (!contains) {
          requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
        }
      }

      //intercepted method must be a project operations on a specific project
      //with an id (/project/projectId/... or /activity/projectId/...). 
      if (pathParts.length > 1 && (pathParts[0].equalsIgnoreCase("project")
              || pathParts[0].equalsIgnoreCase("activity")
              || pathParts[0].equalsIgnoreCase("notebook")
              || pathParts[0].equalsIgnoreCase("interpreter"))) {

        RESTApiJsonResponse json = new RESTApiJsonResponse();
        Integer projectId;
        String userRole;
        try {
          projectId = Integer.valueOf(pathParts[1]);
        } catch (NumberFormatException ne) {
          //if the second pathparam is not a project id return.
          log.log(Level.INFO,
                  "Call to {0} has no project id, leaving interceptor.",
                  path);
          return;
        }
        
        Project project = projectBean.find(projectId);
        if (project == null) {
          requestContext.abortWith(Response.
                  status(Response.Status.NOT_FOUND).build());
          return;
        }
        log.log(Level.FINEST, "Filtering project request path: {0}", project.
                getName());

        if (!method.isAnnotationPresent(AllowedProjectRoles.class)) {
          //Should throw exception if there is a method that is not annotated in this path.
          requestContext.abortWith(Response.
                  status(Response.Status.SERVICE_UNAVAILABLE).build());
          return;
        }
        AllowedProjectRoles rolesAnnotation = method.getAnnotation(AllowedProjectRoles.class);
        Set<String> rolesSet;
        rolesSet = new HashSet<>(Arrays.asList(rolesAnnotation.value()));

        //If the resource is allowed for all roles continue with the request. 
        if (rolesSet.contains(AllowedProjectRoles.ANYONE)) {
          log.log(Level.FINEST, "Accessing resource that is allowed for all");
          return;
        }

        userRole = projectTeamBean.findCurrentRole(project, user);

        if (userRole == null || userRole.isEmpty()) {
          log.log(Level.INFO,
                  "Trying to access resource, but you dont have any role in this project");
          json.setErrorCode(Response.Status.FORBIDDEN.getStatusCode());
          json.setErrorMsg("You do not have access to this project.");
          requestContext.abortWith(Response
                  .status(Response.Status.FORBIDDEN)
                  .entity(json)
                  .build());
        } else if (!rolesSet.contains(userRole)) {
          log.log(Level.INFO,
                  "Trying to access resource that is only allowed for: {0}, But you are a: {1}",
                  new Object[]{rolesSet, userRole});
          json.setErrorCode(Response.Status.FORBIDDEN.getStatusCode());
          json.setErrorMsg(
                  "Your role in this project is not authorized to perform this action.");
          requestContext.abortWith(Response
                  .status(Response.Status.FORBIDDEN)
                  .entity(json)
                  .build());
        }
      }
    } catch (Exception e) {
      log.log(Level.SEVERE, "#### invalid token : {0}", token);
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
    }
  }
}
