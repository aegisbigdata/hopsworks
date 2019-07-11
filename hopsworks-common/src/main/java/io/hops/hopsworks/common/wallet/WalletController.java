package io.hops.hopsworks.common.wallet;

import io.hops.hopsworks.common.dao.dataset.Dataset;
import io.hops.hopsworks.common.dao.dataset.DatasetFacade;
import io.hops.hopsworks.common.dao.hdfs.inode.Inode;
import io.hops.hopsworks.common.dao.hdfs.inode.InodeFacade;
import io.hops.hopsworks.common.dao.project.Project;
import io.hops.hopsworks.common.dao.project.ProjectFacade;
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
  @EJB
  private ProjectFacade projectFacade;
  @EJB
  private DatasetFacade datasetFacade;
  @EJB
  private InodeFacade inodeFacade;
  
  public void shareDataset(DatasetJSON datasetJSON, Users requester) {
    Inode datasetInode = inodeFacade.findById(datasetJSON.getDatasetInodeId());
    Project project = projectFacade.findByName(datasetJSON.projectName);
    Dataset dataset = datasetFacade.findByProjectAndInode(project, datasetInode);
    shareDataset(dataset, requester);
  }
  
  public void shareDataset(Dataset dataset, Users requester) {
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
}
