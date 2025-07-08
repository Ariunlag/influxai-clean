from .client import influx_services  

def list_measurements(bucket: str) -> list[str]:
    """
    Return all measurement names in the specified bucket.
    """
    query = f'''
        import "influxdata/influxdb/schema"
        schema.measurements(bucket: "{bucket}")
    '''
    tables = influx_services.query_api.query(query)
    print(f"Measurements in bucket '{bucket}': {[record.get_value() for table in tables for record in table.records]}")
    return [record.get_value() for table in tables for record in table.records]


def list_tag_keys(bucket: str, measurement: str) -> list[str]:
    """
    Return all tag keys for a given measurement in the bucket.
    """
    query = f'''
        import "influxdata/influxdb/schema"
        schema.tagKeys(
            bucket: "{bucket}",
            predicate: (r) => r._measurement == "{measurement}"
        )
    '''
    tables = influx_services.query_api.query(query)
    print(f"Tag keys in measurement '{measurement}': {[record.get_value() for table in tables for record in table.records]}")
    return [record.get_value() for table in tables for record in table.records]
    


def list_tag_values(bucket: str, measurement: str, tag_key: str) -> list[str]:
    """
    Return all tag values for a given tag key in the measurement.
    """
    query = f'''
        import "influxdata/influxdb/schema"
        schema.tagValues(
            bucket: "{bucket}",
            tag: "{tag_key}",
            predicate: (r) => r._measurement == "{measurement}"
        )
    '''
    tables = influx_services.query_api.query(query)
    print(f"Tag values for '{tag_key}' in measurement '{measurement}': {[record.get_value() for table in tables for record in table.records]}")
    return [record.get_value() for table in tables for record in table.records]

