/*
 * Changes to this file committed after and not including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
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
 * Changes to this file committed before and including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
 * Copyright (C) 2013 - 2018, Logical Clocks AB and RISE SICS AB. All rights reserved
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS  OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package io.hops.hopsworks.api.elastic;

import com.google.common.base.Strings;
import io.hops.hopsworks.api.filter.AllowedProjectRoles;
import io.hops.hopsworks.api.filter.Audience;
import io.hops.hopsworks.api.filter.NoCacheResponse;
import io.hops.hopsworks.api.jwt.JWTHelper;
import io.hops.hopsworks.common.dao.user.Users;
import io.hops.hopsworks.common.elastic.ElasticAggregation;
import io.hops.hopsworks.common.elastic.ElasticController;
import io.hops.hopsworks.common.elastic.ElasticHit;
import io.hops.hopsworks.common.exception.ServiceException;
import io.hops.hopsworks.jwt.annotation.JWTRequired;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiParam;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@Path("/elastic")
@Stateless
@JWTRequired(acceptedTokens={Audience.API}, allowedUserRoles={"HOPS_ADMIN", "HOPS_USER"})
@Produces(MediaType.APPLICATION_JSON)
@Api(value = "Elastic Service", description = "Elastic Service")
@TransactionAttribute(TransactionAttributeType.NEVER)
public class ElasticService {

  private static final Logger logger = Logger.getLogger(ElasticService.class.
          getName());
  @EJB
  private NoCacheResponse noCacheResponse;
  @EJB
  private ElasticController elasticController;
  @EJB
  private JWTHelper jWTHelper;
  
  /**
   * Aggregation end point aegis
   * <p/>
   * @param q
   * @param type
   * @param fileType
   * @param minDate
   * @param maxDate
   * @param license
   * @param minPrice
   * @param maxPrice
   * @param projId
   * @param owner
   * @param req
   * @return
   */
  @GET
  @Path("aggregation")
  @Produces(MediaType.APPLICATION_JSON)
  public Response aggregation(
    @ApiParam(value = "The query") @QueryParam("q") String q,
    @ApiParam(value = "Filter by type prof, ds or inode (default: all)") @QueryParam("type") List<String> type,
    @ApiParam(value = "Filter by file type (default: all)") @QueryParam("fileType") List<String> fileType,
    @ApiParam(value = "Filter by date, gte (default: all)") @QueryParam("minDate") String minDate,
    @ApiParam(value = "Filter by date, lte (default: all)") @QueryParam("maxDate") String maxDate,
    @ApiParam(value = "Filter by license (default: all)") @QueryParam("license") List<String> license,
    @ApiParam(value = "Filter by price, gte (default: all)") @QueryParam("minPrice") Float minPrice,
    @ApiParam(value = "Filter by price, lte (default: all)") @QueryParam("maxPrice") Float maxPrice,
    @ApiParam(value = "Filter by project id (default: all)") @QueryParam("projId") List<String> projId,
    @ApiParam(value = "Filter by owner my and/or others (default: all)") @QueryParam("owner") List<String> owner,
    @Context HttpServletRequest req) throws ServiceException {
    if (Strings.isNullOrEmpty(q)) {
      q = "";
    }
    
    if (type == null) {
      type = new ArrayList<>();
    }
  
    if (fileType == null) {
      fileType = new ArrayList<>();
    }
  
    if (license == null) {
      license = new ArrayList<>();
    }
    
    if (projId == null) {
      projId = new ArrayList<>();
    }
    
    if (owner == null) {
      owner = new ArrayList<>();
    }
  
    Long minDateLong = null;
    if (minDate != null) {
      try {
        minDateLong = new SimpleDateFormat("dd-MM-yyyy").parse(minDate).getTime();
      } catch (ParseException e) {
        e.printStackTrace();
      }
    }
  
    Long maxDateLong = null;
    if (maxDate != null) {
      try {
        maxDateLong = new SimpleDateFormat("dd-MM-yyyy").parse(maxDate).getTime();
      } catch (ParseException e) {
        e.printStackTrace();
      }
    }
  
    Users user = jWTHelper.getUserPrincipal(req);
    String username = user.getFname() + " " + user.getLname();
    
    logger.log(Level.INFO, "Local content path {0}", req.getRequestURL().toString());
    GenericEntity<List<ElasticAggregation>> searchResults =
      new GenericEntity<List<ElasticAggregation>>(elasticController.aggregation(q, type, fileType, license, minPrice,
        maxPrice, projId, minDateLong, maxDateLong, owner, username)) {};
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK).entity(searchResults).build();
  }
  
  /**
   * Search end point aegis
   * <p/>
   * @param q
   * @param sort
   * @param order
   * @param type
   * @param fileType
   * @param minDate
   * @param maxDate
   * @param license
   * @param page
   * @param limit
   * @param minPrice
   * @param maxPrice
   * @param projId
   * @param owner
   * @param req
   * @return
   */
  @GET
  @Path("search")
  @Produces(MediaType.APPLICATION_JSON)
  public Response search(
    @ApiParam(value = "The query") @QueryParam("q") String q,
    @ApiParam(value = "Sort by title, relevance or date (default: relevance)") @QueryParam("sort") String sort,
    @ApiParam(value = "Sort order asc/desc (default: desc)") @QueryParam("order") String order,
    @ApiParam(value = "Filter by type prof, ds or inode (default: all)") @QueryParam("type") List<String> type,
    @ApiParam(value = "Filter by file type (default: all)") @QueryParam("fileType") List<String> fileType,
    @ApiParam(value = "Filter by date, gte (default: all)") @QueryParam("minDate") String minDate,
    @ApiParam(value = "Filter by date, lte (default: all)") @QueryParam("maxDate") String maxDate,
    @ApiParam(value = "Filter by license (default: all)") @QueryParam("license") List<String> license,
    @ApiParam(value = "Filter by price, gte (default: all)") @QueryParam("minPrice") Float minPrice,
    @ApiParam(value = "Filter by price, lte (default: all)") @QueryParam("maxPrice") Float maxPrice,
    @ApiParam(value = "The page number of matching results") @QueryParam("page") Integer page,
    @ApiParam(value = "The maximum number of matching results per page") @QueryParam("limit") Integer limit,
    @ApiParam(value = "Filter by project id (default: all)") @QueryParam("projId") List<String> projId,
    @ApiParam(value = "Filter by owner my and/or others (default: all)") @QueryParam("owner") List<String> owner,
    @Context HttpServletRequest req) throws ServiceException {
    if (Strings.isNullOrEmpty(q)) {
      q = "";
    }
  
    if (Strings.isNullOrEmpty(sort)) {
      sort = "relevance";
    }
  
    if (Strings.isNullOrEmpty(order)) {
      order = "desc";
    }
  
    if (type == null) {
      type = new ArrayList<>();
    }
  
    if (fileType == null) {
      fileType = new ArrayList<>();
    }
    
    if (license == null) {
      license =  new ArrayList<>();
    }
    
    if (page == null || page < 0) {
      page = 0;
    }
    
    if (limit == null || limit < 0) {
      limit = 15;
    }
  
    if (projId == null) {
      projId = new ArrayList<>();
    }
  
    if (owner == null) {
      owner = new ArrayList<>();
    }
  
    Long minDateLong = null;
    if (minDate != null) {
      try {
        minDateLong = new SimpleDateFormat("dd-MM-yyyy").parse(minDate).getTime();
      } catch (ParseException e) {
        e.printStackTrace();
      }
    }
  
    Long maxDateLong = null;
    if (maxDate != null) {
      try {
        maxDateLong = new SimpleDateFormat("dd-MM-yyyy").parse(maxDate).getTime();
      } catch (ParseException e) {
        e.printStackTrace();
      }
    }
  
    Users user = jWTHelper.getUserPrincipal(req);
    String username = user.getFname() + " " + user.getLname();
    
    logger.log(Level.INFO, "Local content path {0}", req.getRequestURL().toString());
    GenericEntity<List<ElasticHit>> searchResults =
      new GenericEntity<List<ElasticHit>>(elasticController.search(q, sort, order, type, fileType, license, page,
        limit, minPrice, maxPrice, projId, minDateLong, maxDateLong, owner, username)) {};
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK).entity(searchResults).build();
  }
  
  /**
   * Searches for content composed of projects and datasets. Hits two elastic
   * indices: 'project' and 'dataset'
   * <p/>
   * @param searchTerm
   * @param req
   * @return
   */
  @GET
  @Path("globalsearch/{searchTerm}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response globalSearch(@PathParam("searchTerm") String searchTerm,
    @QueryParam("type") String type, @Context HttpServletRequest req) throws ServiceException {

    if (Strings.isNullOrEmpty(searchTerm)) {
      throw new IllegalArgumentException("searchTerm was not provided or was empty");
    }

    logger.log(Level.INFO, "Local content path {0}", req.getRequestURL().toString());
    GenericEntity<List<ElasticHit>> searchResults = new GenericEntity<List<ElasticHit>>(elasticController.
        globalSearch(searchTerm)) {};
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK).entity(searchResults).build();
  }

  /**
   * Searches for content inside a specific project. Hits 'project' index
   * <p/>
   * @param projectId
   * @param searchTerm
   * @param sc
   * @param req
   * @return
   */
  @GET
  @Path("projectsearch/{projectId}/{searchTerm}")
  @Produces(MediaType.APPLICATION_JSON)
  @AllowedProjectRoles({AllowedProjectRoles.DATA_SCIENTIST, AllowedProjectRoles.DATA_OWNER})
  public Response projectSearch(@PathParam("projectId") Integer projectId,
      @PathParam("searchTerm") String searchTerm) throws ServiceException {
    if (Strings.isNullOrEmpty(searchTerm) || projectId == null) {
      throw new IllegalArgumentException("One or more required parameters were not provided.");
    }

    GenericEntity<List<ElasticHit>> searchResults = new GenericEntity<List<ElasticHit>>(elasticController.projectSearch(
        projectId, searchTerm)) {};
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK).entity(searchResults).build();
  }

  /**
   * Searches for content inside a specific dataset. Hits 'dataset' index
   * <p/>
   * @param projectId
   * @param datasetName
   * @param searchTerm
   * @param sc
   * @param req
   * @return
   */
  @GET
  @Path("datasetsearch/{projectId}/{datasetName}/{searchTerm}")
  @Produces(MediaType.APPLICATION_JSON)
  @AllowedProjectRoles({AllowedProjectRoles.DATA_SCIENTIST, AllowedProjectRoles.DATA_OWNER})
  public Response datasetSearch(
      @PathParam("projectId") Integer projectId,
      @PathParam("datasetName") String datasetName,
      @PathParam("searchTerm") String searchTerm) throws ServiceException {
  
    if (Strings.isNullOrEmpty(searchTerm) || Strings.isNullOrEmpty(datasetName) || projectId == null) {
      throw new IllegalArgumentException("One or more required parameters were not provided.");
    }

    GenericEntity<List<ElasticHit>> searchResults = new GenericEntity<List<ElasticHit>>(elasticController.
                    datasetSearch(projectId, datasetName, searchTerm)) {};
    return noCacheResponse.getNoCacheResponseBuilder(Response.Status.OK). entity(searchResults).build();
  }

}
