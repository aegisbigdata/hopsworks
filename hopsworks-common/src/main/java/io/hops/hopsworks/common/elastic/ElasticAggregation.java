package io.hops.hopsworks.common.elastic;

import org.elasticsearch.search.aggregations.bucket.terms.ParsedStringTerms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.LinkedList;
import java.util.List;

@XmlRootElement
public class ElasticAggregation {
  
  public String name;
  public List<ElasticAggregationItem> items;
  
  public class ElasticAggregationItem {
    public String name;
    public long count;
  
    public ElasticAggregationItem(String name, long count) {
      this.name = name;
      this.count = count;
    }
  
    public String getName() {
      return name;
    }
  
    public void setName(String name) {
      this.name = name;
    }
  
    public long getCount() {
      return count;
    }
  
    public void setCount(long count) {
      this.count = count;
    }
  }
  
  public ElasticAggregation(String name) {
    this.name = name;
    this.items = new LinkedList<>();
  }
  
  public ElasticAggregation(ParsedStringTerms aggregation) {
    this.name = aggregation.getName();
    
    this.items = new LinkedList<>();
  
    for (Terms.Bucket bucket : aggregation.getBuckets()) {
      String name = bucket.getKey().toString();
      long count = bucket.getDocCount();
      
      this.items.add(new ElasticAggregationItem(name, count));
    }
  }
  
  public String getName() {
    return name;
  }
  
  public void setName(String name) {
    this.name = name;
  }
  
  public List<ElasticAggregationItem> getItems() {
    return items;
  }
  
  public void setItems(List<ElasticAggregationItem> items) {
    this.items = items;
  }
}
