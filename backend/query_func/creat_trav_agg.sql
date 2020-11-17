--------------------------------------------------------------------------------------------------------------
--INPUTS
--------------------------------------------------------------------------------------------------------------
-- user's selected time range 
-- period (text): name of period (e.g. 'AM Peak')
-- time_range (timerange): time range of each period (e.g.'[07:00:00,10:00:00)' for 7am to 10am)
WITH selected_time_range AS (
	SELECT 		period, 
				time_range, 
				extract(epoch FROM upper(time_range) - lower(time_range))/300 AS num_5_bin
  	FROM 		(VALUES('AM Peak'::text, '[07:00:00,10:00:00)'::timerange),
						('PM Peak'::text,'[16:00:00,18:00:00)'::timerange)) AS t (period, time_range))


-- user's selected routes
-- id (int): uid for each corridor
-- link_agg (text[]): text array of link_dir for each corridor
, selected_routes(id, link_agg) AS (
         VALUES (1, '{1089876308F,1056118621F,991815148F,29589776F}'::text[]), 
		        (2, '{1089876307T,29589779T,1062761500T,1062761498T}'::text[]))
				
                
-- user's selected dates
-- start date (date): start of requested date range
-- end date (Date): end of requested date range
-- dow: day of week (e.g. Monday = 1)
-- is_holiday (Boolean): include holiday or not (e.g. TRUE if include)
, date_info(start_date, end_date, dow, is_holiday) AS (
		VALUES ('2020-09-01'::date, '2020-09-15'::date, '{1,2,3,5,6}'::int[], TRUE))

----------------------------------------------------------------------------------------------------------------------------
-- calculate num_days, and interested date
, selected_date_range as (
	SELECT  dt,
		  (COUNT (dt) OVER ()) as requested_days
	FROM (SELECT start_date, end_date, dow, is_holiday, generate_series(start_date, end_date, '1 day'::interval)::date as dt 
		   FROM date_info) dates
	LEFT JOIN ref.holiday holiday using (dt)
	WHERE date_part('isodow', dt::date)::int = ANY(dow)
            AND (((is_holiday is FALSE AND holiday.dt is null)) OR (is_holiday)))

-- requested routes and its length
, study_link AS ( 																											 
	SELECT a.*, st_length(st_transform(geom, 2952)) AS here_length 
	
    FROM (select id, 
		  unnest(link_agg) AS link_dir FROM 
		  selected_routes
		 )a
	
    INNER JOIN here.routing_streets_19_4_tc using (link_dir)
)

-- number of segments in an id corridor
, seg AS (
	SELECT 		id,
				sum(here_length) AS total_length,
				count(link_dir) AS num_seg
			FROM 		study_link
			GROUP BY	id
)

-- hourly travel time for each link
, link_hourly AS (
	SELECT  	id, 
				link_dir, 
				here_length,
				datetime_bin(tx, 60) AS datetime_bin, 
				period,
				avg((here_length*0.001)/mean*3600) AS mean_tt,
				count(1) AS link_obs,
				requested_days,
				requested_days * num_5_bin AS total_requested_num_5
	FROM 		study_link
	INNER JOIN here.ta a using (link_dir)
	CROSS JOIN selected_time_range
	INNER JOIN selected_date_range ON dt = date_trunc('day', tx) -- user requested date range
	WHERE tx::time <@ time_range
	GROUP BY id, link_dir, period, datetime_bin, here_length, requested_days, total_requested_num_5
)

-- sum up link level travel time to get hourly corridor travel time 
, corridor_hourly AS (
	SELECT 		b.id, 
				datetime_bin,
				period,
				sum(mean_tt) AS corr_tt,
				sum(link_obs) AS obs, 
				total_length,
				count(distinct link_dir), 
				requested_days,
				total_requested_num_5*num_seg as total_requested_num_5
	FROM   		link_hourly
	join 		seg b using (id)
	WHERE       link_obs >=2
	GROUP BY datetime_bin, b.id, total_length, num_seg, period, requested_days, total_requested_num_5
	HAVING sum(here_length) >= total_length*0.8
	order by b.id, num_seg
)

-- daily corridor travel time 
, corridor_daily AS (
	SELECT 		id, 
				date_trunc('day',datetime_bin) AS dt,
				period,
				avg(corr_tt) AS corr_mean_tt,
				sum(obs) AS actual_obs, 
				total_length,
				requested_days,
				total_requested_num_5
	
	FROM corridor_hourly
	GROUP BY dt, id, total_length, period, requested_days, total_requested_num_5
	order by id, dt
)

-- calculating metrics FROM daily corridor travel time

	SELECT 		id,  
				period,
				-- travel time
				avg(corr_mean_tt)/60 AS mean_tt,
				min(corr_mean_tt)/60 AS min_tt,
				max(corr_mean_tt)/60 AS max_tt,
				percentile_cont(0.05) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_5_tt,
				percentile_cont(0.10) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_10_tt,
				percentile_cont(0.15) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_15_tt,
				percentile_cont(0.20) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_20_tt,
				percentile_cont(0.25) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_25_tt,
				percentile_cont(0.30) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_30_tt,
				percentile_cont(0.35) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_35_tt,
				percentile_cont(0.40) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_40_tt,
				percentile_cont(0.45) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_45_tt,
				percentile_cont(0.50) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_50_tt,
				percentile_cont(0.55) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_55_tt,
				percentile_cont(0.60) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_60_tt,
				percentile_cont(0.65) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_65_tt,
				percentile_cont(0.70) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_70_tt,
				percentile_cont(0.75) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_75_tt,
				percentile_cont(0.80) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_80_tt,
				percentile_cont(0.85) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_85_tt,
				percentile_cont(0.90) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_90_tt,
				percentile_cont(0.95) WITHIN GROUP (ORDER BY corr_mean_tt/60 DESC) AS pct_95_tt,
				stddev(corr_mean_tt/60) AS std_dev,
	
				-- example of converting travel time to speed 
				total_length/min(corr_mean_tt)* (3600.0 / 1000.0) AS min_spd,
				total_length/avg(corr_mean_tt)* (3600.0 / 1000.0) AS mean_spd,
				total_length/max(corr_mean_tt)* (3600.0 / 1000.0) AS max_spd,
				total_length,
				count(1) AS days_of_data,
				requested_days,
				actual_obs /total_requested_num_5 as prop_5min
				
	
FROM corridor_daily
GROUP BY id, period, total_length, requested_days, actual_obs, total_requested_num_5