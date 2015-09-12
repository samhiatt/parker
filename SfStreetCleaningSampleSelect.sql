WITH t3 AS (
	WITH t2 AS (
		WITH t AS (SELECT *, 
				ST_Transform(ST_GeomFromEWKT('srid=4326;POINT(-122.444 37.72)'),2227) AS point,
				ST_GeometryN(geom,1) AS line,
				ST_ClosestPoint(
						ST_GeometryN(geom,1),
						ST_Transform(ST_GeomFromEWKT('srid=4326;POINT(-122.444 37.72)'),2227)
					) AS point_on_street
			FROM sfsweeproutes 
			WHERE ST_DWithin(geom,ST_Transform(ST_GeomFromEWKT('srid=4326;POINT(-122.444 37.72)'),2227),300) 
				-- AND ( blockside LIKE '%East%' OR blockside LIKE '%North%' )
		) SELECT *, 
			--degrees( ST_Azimuth(ST_StartPoint(line), ST_EndPoint(line)) ) AS street_direction,
			ST_Distance(geom,point) AS distance,
			ST_Line_Locate_Point(line, ST_ClosestPoint(line, point)) ,
			ST_AsText(ST_Line_Substring(line,ST_Line_Locate_Point(line, point_on_street),
			LEAST(ST_Line_Locate_Point(line, point_on_street)+.1,1))) AS segment
		FROM t
	) SELECT gid, weekday, blockside, cnnrightle, fromhour, tohour, streetname, distance,
		ST_X(ST_StartPoint(ST_GeometryN(segment,1))) * ST_Y(point) - ST_Y(ST_StartPoint(ST_GeometryN(segment,1))) * ST_X(point) AS cross_product
	 FROM t2
 ) SELECT *, 
	CASE WHEN cross_product>0 THEN 'R'
	WHEN cross_product<0 THEN 'L'
	ELSE '-'
	END
 FROM t3
 ORDER BY distance;