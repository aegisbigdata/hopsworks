package io.hops.hopsworks.api.filter;

import io.hops.hopsworks.common.constants.auth.AllowedGroups;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface AllowedProjectGroups {
  
  String ANYONE = AllowedGroups.ALL;
  String HOPS_ADMIN = AllowedGroups.HOPS_ADMIN;
  String HOPS_USER = AllowedGroups.HOPS_USER;
  String AGENT = AllowedGroups.AGENT;
  String AUDITOR = AllowedGroups.AUDITOR;
  
  String[] value() default {AllowedProjectGroups.HOPS_USER};
}
