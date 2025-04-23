import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const TokenChart = () => {
  const series = [73, 55, 38, 20];

  const options: ApexOptions = {
    chart: {
      type: "donut",
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
    colors: ["#2347B9", "#3363FF", "#8BA6FF", "#8696CA"],
    legend: {
      show: false,
    },
    stroke: {
      show: false,
    },
  };

  return (
    <>
      <ReactApexChart options={options} series={series} type="donut" />
    </>
  );
};

export default TokenChart;
