package io.hops.hopsworks.common.elastic;

import org.elasticsearch.search.aggregations.bucket.filter.InternalFilter;
import org.elasticsearch.search.aggregations.bucket.terms.StringTerms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.metrics.InternalNumericMetricsAggregation;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

@XmlRootElement
public class ElasticAggregation implements Comparator<ElasticAggregation> {
  
  public String name;
  public Map<String, Long> map;
  public Double value;
  
  public ElasticAggregation() {
  }
  
  public ElasticAggregation(String name) {
    this.name = name;
    this.map = new HashMap<>();
  }
  
  public ElasticAggregation(InternalNumericMetricsAggregation.SingleValue aggregation) {
    this.name = aggregation.getName();
    this.value = aggregation.value();
  }
  
  public ElasticAggregation(StringTerms aggregation) {
    this.name = aggregation.getName();
    
    this.map = new HashMap<>();
  
    for (Terms.Bucket bucket : aggregation.getBuckets()) {
      String name = bucket.getKey().toString();
      long count = bucket.getDocCount();
      this.map.put(name, count);
    }
  }
  
  public ElasticAggregation(InternalFilter aggregation) {
    this.name = aggregation.getName();
    this.value = (double) aggregation.getDocCount();
  }
  
  public String getName() {
    return name;
  }
  
  public void setName(String name) {
    this.name = name;
  }
  
  public void setMap(Map<String, Long> map) {
    this.map = new HashMap<>(map);
  }
  
  public Map<String, Long> getMap() {
    return map;
  }
  
  public Double getValue() {
    return value;
  }
  
  public void setValue(Double value) {
    this.value = value;
  }
  
  @Override
  public int compare(ElasticAggregation o1, ElasticAggregation o2) {
    return o1.getName().compareTo(o2.getName());
  }
}
