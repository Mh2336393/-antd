function getProbesData(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: [
      {
        sensor_id: '6c92bf676214',
        real_pack: 0,
        ip: '127.0.0.1',
        cpu_usage: 3,
        mem_usage: 78,
        disk_usage: 56,
        unnormal_service: 0,
        normal_service: 2,
        interface_state: true,
        node_state: true,
        runtime: 31,
        timestamp: '2018-10-19 18:04:52',
        status: false,
        chartData: [
          {
            time_string: '2018-10-19T10:04:30.000Z',
            timestamp: 1539943470000,
            value: 10,
          },
          {
            time_string: '1539160200000',
            timestamp: 1539160200000,
            value: 20,
          },
          {
            time_string: '1539162000000',
            timestamp: 1539162000000,
            value: 30,
          },
          {
            time_string: '1539163800000',
            timestamp: 1539163800000,
            value: 40,
          },
          {
            time_string: '1539165600000',
            timestamp: 1539165600000,
            value: 50,
          },
          {
            time_string: '1539167400000',
            timestamp: 1539167400000,
            value: 60,
          },
          {
            time_string: '1539169200000',
            timestamp: 1539169200000,
            value: 70,
          },
          {
            time_string: '1539171000000',
            timestamp: 1539171000000,
            value: 80,
          },
          {
            time_string: '1539172800000',
            timestamp: 1539172800000,
            value: 70,
          },
          {
            time_string: '1539174600000',
            timestamp: 1539174600000,
            value: 60,
          },
          {
            time_string: '1539176400000',
            timestamp: 1539176400000,
            value: 50,
          },
          {
            time_string: '1539178200000',
            timestamp: 1539178200000,
            value: 30,
          },
          {
            time_string: '1539180000000',
            timestamp: 1539180000000,
            value: 20,
          },
          {
            time_string: '1539181800000',
            timestamp: 1539181800000,
            value: 40,
          },
          {
            time_string: '1539183600000',
            timestamp: 1539183600000,
            value: 30,
          },
          {
            time_string: '1539185400000',
            timestamp: 1539185400000,
            value: 20,
          },
          {
            time_string: '1539187200000',
            timestamp: 1539187200000,
            value: 60,
          },
          {
            time_string: '1539189000000',
            timestamp: 1539189000000,
            value: 30,
          },
          {
            time_string: '1539190800000',
            timestamp: 1539190800000,
            value: 40,
          },
          {
            time_string: '1539192600000',
            timestamp: 1539192600000,
            value: 20,
          },
        ],
      },
      {
        sensor_id: '6c92bf676215',
        real_pack: 0,
        ip: '127.0.0.2',
        cpu_usage: 3,
        mem_usage: 78,
        disk_usage: 56,
        unnormal_service: 0,
        normal_service: 2,
        interface_state: true,
        node_state: true,
        runtime: 31,
        timestamp: '2018-10-19 18:04:52',
        status: false,
        chartData: [
          {
            time_string: '2018-10-19T10:04:30.000Z',
            timestamp: 1539943470000,
            value: 10,
          },
          {
            time_string: '1539160200000',
            timestamp: 1539160200000,
            value: 20,
          },
          {
            time_string: '1539162000000',
            timestamp: 1539162000000,
            value: 30,
          },
          {
            time_string: '1539163800000',
            timestamp: 1539163800000,
            value: 40,
          },
          {
            time_string: '1539165600000',
            timestamp: 1539165600000,
            value: 50,
          },
          {
            time_string: '1539167400000',
            timestamp: 1539167400000,
            value: 60,
          },
          {
            time_string: '1539169200000',
            timestamp: 1539169200000,
            value: 70,
          },
          {
            time_string: '1539171000000',
            timestamp: 1539171000000,
            value: 80,
          },
          {
            time_string: '1539172800000',
            timestamp: 1539172800000,
            value: 70,
          },
          {
            time_string: '1539174600000',
            timestamp: 1539174600000,
            value: 60,
          },
          {
            time_string: '1539176400000',
            timestamp: 1539176400000,
            value: 40,
          },
          {
            time_string: '1539178200000',
            timestamp: 1539178200000,
            value: 60,
          },
          {
            time_string: '1539180000000',
            timestamp: 1539180000000,
            value: 50,
          },
          {
            time_string: '1539181800000',
            timestamp: 1539181800000,
            value: 30,
          },
          {
            time_string: '1539183600000',
            timestamp: 1539183600000,
            value: 20,
          },
          {
            time_string: '1539185400000',
            timestamp: 1539185400000,
            value: 10,
          },
          {
            time_string: '1539187200000',
            timestamp: 1539187200000,
            value: 20,
          },
          {
            time_string: '1539189000000',
            timestamp: 1539189000000,
            value: 40,
          },
          {
            time_string: '1539190800000',
            timestamp: 1539190800000,
            value: 20,
          },
          {
            time_string: '1539192600000',
            timestamp: 1539192600000,
            value: 10,
          },
        ],
      },
    ],
  };
  return res.json(result);
}
function getLineChartData(req, res) {
  const result = {
    error_code: 0,
    msg: 'succ',
    data: {
      index: 0,
      chartData: [
        {
          time_string: '2018-10-19T10:04:30.000Z',
          timestamp: 1539943470000,
          value: 1,
        },
        {
          time_string: '1539160200000',
          timestamp: 1539160200000,
          value: 2,
        },
        {
          time_string: '1539162000000',
          timestamp: 1539162000000,
          value: 3,
        },
        {
          time_string: '1539163800000',
          timestamp: 1539163800000,
          value: 4,
        },
        {
          time_string: '1539165600000',
          timestamp: 1539165600000,
          value: 5,
        },
        {
          time_string: '1539167400000',
          timestamp: 1539167400000,
          value: 6,
        },
        {
          time_string: '1539169200000',
          timestamp: 1539169200000,
          value: 7,
        },
        {
          time_string: '1539171000000',
          timestamp: 1539171000000,
          value: 8,
        },
        {
          time_string: '1539172800000',
          timestamp: 1539172800000,
          value: 7,
        },
        {
          time_string: '1539174600000',
          timestamp: 1539174600000,
          value: 6,
        },
        {
          time_string: '1539176400000',
          timestamp: 1539176400000,
          value: 4,
        },
        {
          time_string: '1539178200000',
          timestamp: 1539178200000,
          value: 6,
        },
        {
          time_string: '1539180000000',
          timestamp: 1539180000000,
          value: 5,
        },
        {
          time_string: '1539181800000',
          timestamp: 1539181800000,
          value: 3,
        },
        {
          time_string: '1539183600000',
          timestamp: 1539183600000,
          value: 2,
        },
        {
          time_string: '1539185400000',
          timestamp: 1539185400000,
          value: 1,
        },
        {
          time_string: '1539187200000',
          timestamp: 1539187200000,
          value: 2,
        },
        {
          time_string: '1539189000000',
          timestamp: 1539189000000,
          value: 4,
        },
        {
          time_string: '1539190800000',
          timestamp: 1539190800000,
          value: 2,
        },
        {
          time_string: '1539192600000',
          timestamp: 1539192600000,
          value: 1,
        },
      ],
    },
  };
  return res.json(result);
}
export default {
  'POST /api/dashboard/allprobes': getProbesData,
  'POST /api/dashboard/lineChartData': getLineChartData,
};
