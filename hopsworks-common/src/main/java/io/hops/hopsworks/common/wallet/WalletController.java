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
import java.util.List;
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

  public UserJSON createUser(UserJSON user) {
    ClientWrapper<UserJSON> client = ClientWrapper.httpsInstance(UserJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User").setMediaType(MediaType.APPLICATION_JSON).setPayload(user);
    UserJSON result = client.doPost();
    client.close();
    return result;
  }

  public List<UserJSON> getUsers() {
    ClientWrapper<UserJSON> client = ClientWrapper.httpsInstance(UserJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User").setMediaType(MediaType.APPLICATION_JSON);
    List<UserJSON> result = client.doGetGenericType();
    client.close();
    return result;
  }

  public UserJSON getUser(String uid) {
    ClientWrapper<UserJSON> client = ClientWrapper.httpsInstance(UserJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/User/" + uid).setMediaType(MediaType.APPLICATION_JSON);
    UserJSON result = client.doGet();
    client.close();
    return result;
  }

  public AEGISAssetJSON createAsset(AEGISAssetJSON asset) {
    ClientWrapper<AEGISAssetJSON> client = ClientWrapper.httpsInstance(AEGISAssetJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset").setMediaType(MediaType.APPLICATION_JSON).setPayload(asset);
    AEGISAssetJSON result = client.doPost();
    client.close();
    return result;
  }

  public List<AEGISAssetJSON> getAssets() {
    ClientWrapper<AEGISAssetJSON> client = ClientWrapper.httpsInstance(AEGISAssetJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset").setMediaType(MediaType.APPLICATION_JSON);
    List<AEGISAssetJSON> result = client.doGetGenericType();
    client.close();
    return result;
  }

  public AEGISAssetJSON getAsset(String aid) {
    ClientWrapper<AEGISAssetJSON> client = ClientWrapper.httpsInstance(AEGISAssetJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/AEGISAsset/" + aid).setMediaType(MediaType.APPLICATION_JSON);
    AEGISAssetJSON result = client.doGet();
    client.close();
    return result;
  }

  public ContractJSON createContract(ContractJSON contract) {
    ClientWrapper<ContractJSON> client = ClientWrapper.httpsInstance(ContractJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract").setMediaType(MediaType.APPLICATION_JSON)
      .setPayload(contract);
    ContractJSON result = client.doPost();
    client.close();
    return result;
  }

  public List<ContractJSON> getContracts() {
    ClientWrapper<ContractJSON> client = ClientWrapper.httpsInstance(ContractJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract").setMediaType(MediaType.APPLICATION_JSON);
    List<ContractJSON> result = client.doGetGenericType();
    client.close();
    return result;
  }

  public List<ContractJSON> getBuyContracts(String uid) {
    String filter = URLEncoder.encode("{\"where\": {\"buyer\": {\"eq\": \"resource:eu.aegis.User#" + uid + "\"}}}");
    ClientWrapper<ContractJSON> client = ClientWrapper.httpsInstance(ContractJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON);
    List<ContractJSON> result = client.doGetGenericType();
    client.close();
    return result;
  }

  public List<ContractJSON> getSellContracts(String uid) {
    String filter = URLEncoder.encode("{\"where\": {\"seller\": {\"eq\": \"resource:eu.aegis.User#" + uid + "\"}}}");
    ClientWrapper<ContractJSON> client = ClientWrapper.httpsInstance(ContractJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract?filter=" + filter).setMediaType(MediaType.APPLICATION_JSON);
    List<ContractJSON> result = client.doGetGenericType();
    client.close();
    return result;
  }

  public ContractJSON validateContract(ValidationJSON validation) {
    ClientWrapper<ContractJSON> client = ClientWrapper.httpsInstance(ContractJSON.class)
      .setTarget(HYPERLEDGER_URL).setPath("api/Contract").setMediaType(MediaType.APPLICATION_JSON)
      .setPayload(validation);
    ContractJSON result = client.doPost();
    client.close();
    return result;
  }

  public static class WalletServerJSONResult {
  }

  public static class UserJSON {
    public String $class = "eu.aegis.User";
    public String uid;
    public float balance;

    public UserJSON() {}

    public String getUid() {
      return this.uid;
    }

    public float getBalance() {
      return this.balance;
    }

    public void setUid(String uid) {
      this.uid = uid;
    }

    public void setBalance(float balance) {
      this.balance = balance;
    }
  }

  public static class AEGISAssetJSON {
    public String $class = "eu.aegis.AEGISAsset";
    public String aid;
    public String assetType;
    public float cost;
    public String status;
    public String owner;

    public AEGISAssetJSON() {}

    public String getAid() {
      return this.aid;
    }

    public String getAssetType() {
      return this.assetType;
    }

    public float getCost() {
      return this.cost;
    }

    public String getStatus() {
      return this.status;
    }

    public String getOwner() {
      return this.owner;
    }

    public void setAid(String aid) {
      this.aid = aid;
    }

    public void setAssetType(String assetType) {
      this.assetType = assetType;
    }

    public void setCost(float cost) {
      this.cost = cost;
    }

    public void setStatus(String status) {
      this.status = status;
    }

    public void setOwner(String owner) {
      this.owner = owner;
    }
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

    public ContractJSON() {}

    public String getTid() {
      return this.tid;
    }

    public String getExclusivity() {
      return this.exclusivity;
    }

    public float getAmountPaid() {
      return this.amountPaid;
    }

    public String getStatus() {
      return this.status;
    }

    public String getText() {
      return this.text;
    }

    public String getSeller() {
      return this.seller;
    }

    public String getBuyer() {
      return this.buyer;
    }

    public String getRelatedAsset() {
      return this.relatedAsset;
    }

    public void setTid(String tid) {
      this.tid = tid;
    }

    public void setExclusivity(String exclusivity) {
      this.exclusivity = exclusivity;
    }

    public void setAmountPaid(float amountPaid) {
      this.amountPaid = amountPaid;
    }

    public void setStatus(String status) {
      this.status = status;
    }

    public void setSeller(String seller) {
      this.seller = seller;
    }

    public void setBuyer(String buyer) {
      this.buyer = buyer;
    }

    public void setRelatedAsset(String relatedAsset) {
      this.relatedAsset = relatedAsset;
    }
  }

  public static class ValidationJSON {
    public String contract;

    public ValidationJSON() {}

    public String getContract() {
      return this.contract;
    }

    public void setContract(String contract) {
      this.contract = contract;
    }
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
