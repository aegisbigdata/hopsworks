package io.hops.hopsworks.common.exception;

import java.util.logging.Level;

public class WalletException extends RESTException {

  public WalletException(RESTCodes.RESTErrorCode errorCode, Level level) {
    super(errorCode, level);
  }

  public WalletException(RESTCodes.RESTErrorCode errorCode, Level level, String usrMsg) {
    super(errorCode, level, usrMsg);
  }

  public WalletException(RESTCodes.RESTErrorCode errorCode, Level level, String usrMsg, String devMsg) {
    super(errorCode, level, usrMsg, devMsg);
  }

  public WalletException(RESTCodes.RESTErrorCode errorCode, Level level, String usrMsg, String devMsg,
    Throwable throwable) {
    super(errorCode, level, usrMsg, devMsg, throwable);
  }
}
