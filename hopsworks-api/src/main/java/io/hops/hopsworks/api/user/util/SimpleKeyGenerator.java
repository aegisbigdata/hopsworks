package io.hops.hopsworks.api.user.util;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;

public class SimpleKeyGenerator implements KeyGenerator {
  
  @Override
  public Key generateKey() {
    String keyString = "2adfj517dAHD828ASiw1";
    Key key = new SecretKeySpec(keyString.getBytes(), 0, keyString.getBytes().length, "DES");
    
    return key;
  }
}