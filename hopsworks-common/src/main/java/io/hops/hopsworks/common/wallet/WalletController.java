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
package io.hops.hopsworks.common.wallet;

import io.hops.hopsworks.common.dao.dataset.Dataset;
import io.hops.hopsworks.common.dao.user.Users;
import io.hops.hopsworks.common.dataset.DatasetController;
import io.hops.hopsworks.common.util.ClientWrapper;
import java.net.URLEncoder;
import java.util.logging.Logger;
import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.ws.rs.core.MediaType;

/**
 * Contains business logic pertaining to Wallet management.
 * <p>
 */
@Stateless
public class WalletController {
  private static final Logger LOGGER = Logger.getLogger(WalletController.class.getName());
  public static final String HYPERLEDGER_URL = "https://localhost:3001";
  
  @EJB
  private DatasetController datasetCtrl;
  
  public void shareDataset(Dataset dataset, Users requestingUser) {
    //TODO - Users provide for email, name, username - any details needed
    //question is which user will you use? the requester or the owner
    Users ownerUser = datasetCtrl.getOwner(dataset);
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget("http://localhost:30000").setPath("wallet/mypath").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
  }
  
  public void joinDataset(Dataset dataset, Users requestingUser) {
    //TODO - use owner for email, name, username - any details needed
    Users owner = datasetCtrl.getOwner(dataset);
  }
  
  public WalletServerJSONResult createUser(UserJSON user) {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User").setMediaType(MediaType.APPLICATION_JSON).setPayload(user);
    WalletServerJSONResult result = client.doPost();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult getUsers() {
    ClientWrapper<WalletController.WalletServerJSONResult> client 
      = ClientWrapper.httpsInstance(WalletController.WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult getUser(String uid) {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User/" + uid).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult createAsset(AEGISAssetJSON asset) {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset").setMediaType(MediaType.APPLICATION_JSON).setPayload(asset);
    WalletServerJSONResult result = client.doPost();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult getAssets() {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult getAsset(String aid) {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset/" + aid).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult createContract(ContractJSON contract) {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract").setMediaType(MediaType.APPLICATION_JSON)
      .setPayload(contract);
    WalletServerJSONResult result = client.doPost();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult getContracts() {
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract").setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult getBuyContracts(String uid) {
    String filter = URLEncoder.encode("{\"where\": {\"buyer\": {\"eq\": \"resource:eu.aegis.User#" + uid + "\"}}}");
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult getSellContracts(String uid) {
    String filter = URLEncoder.encode("{\"where\": {\"seller\": {\"eq\": \"resource:eu.aegis.User#" + uid + "\"}}}");
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON);
    WalletServerJSONResult result = client.doGet();
    client.close();
    return result;
  }
  
  public WalletServerJSONResult validateContract(ValidationJSON validation) {
    //TODO filter was not set here
    String filter = "";
    ClientWrapper<WalletServerJSONResult> client = ClientWrapper.httpsInstance(WalletServerJSONResult.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON)
      .setPayload(validation);
    WalletServerJSONResult result = client.doPost();
    client.close();
    return result;
  }
  public static class WalletServerJSONResult {
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
}
