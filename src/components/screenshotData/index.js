import React, { Component } from "react";
import _ from "lodash";
import { Table, Button, ButtonGroup } from "reactstrap";
import screenShotData from "../../data";
import file1 from "../../img/file1.png";
import file2 from "../../img/file2.png";
import file3 from "../../img/file3.png";
import file4 from "../../img/file4.png";
import file5 from "../../img/file5.png";
import file6 from "../../img/file6.png";
import { Line } from "react-chartjs-2";

const mapScreenshots = {
  "file1.png": file1,
  "file2.png": file2,
  "file3.png": file3,
  "file4.png": file4,
  "file5.png": file5,
  "file6.png": file6,
};

class ScreenshotData extends Component {
  state = {
    chartSelected: {},
    apidata: {},
  };

  componentDidMount = () => {
    let chartSelected = {};
    let apidata = !_.isEmpty(screenShotData) ? screenShotData : {};
    apidata.test_cases.forEach((testCase) => {
      testCase.test_steps.forEach((testStep) => {
        chartSelected[testStep.step_name] = "cpu";
      });
    });
    this.setState({ apidata, chartSelected });
  };

  setChartType = (stepName, type) => {
    const chartSelected = { ...this.state.chartSelected };
    chartSelected[stepName] = type;
    this.setState({ chartSelected });
  };

  getChartData = (stepData) => {
    const chartData = [];
    _.get(stepData, `${this.state.chartSelected[stepData.step_name]}`, []).forEach((d) => chartData.push(d));

    return {
      labels: ["1", "2", "3"],
      datasets: [
        {
          label: "Run",
          data: chartData,
          fill: false,
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgba(255, 99, 132, 0.2)",
        },
      ],
    };
  };

  getChartOptions = (stepData) => {
    let yLabel = {
      cpu: "CPU Usage",
      memory: "Memory Usage",
      launch_times: "Launch Times",
    };
    return {
      defaultFontFamily: "Helvetica",
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false,
        position: "bottom",
        labels: {
          boxWidth: 15,
          padding: 10,
          fontSize: 9,
          fontStyle: "bold",
        },
      },
      scales: {
        xAxes: [
          {
            ticks: {
              fontSize: 9,
              fontStyle: "bold",
            },
            scaleLabel: {
              display: true,
              labelString: "Test Runs",
              fontStyle: "bold",
              padding: 10,
            },
            gridLines: {
              display: false,
              drawBorder: true,
            },
          },
          {
            position: "top",
            ticks: { display: false },
            gridLines: { display: false, drawTicks: false },
          },
        ],
        yAxes: [
          {
            ticks: {
              fontSize: 9,
              fontStyle: "bold",
              padding: 10,
            },
            scaleLabel: {
              display: true,
              labelString: yLabel[this.state.chartSelected[stepData.step_name]],
              fontStyle: "bold",
            },
          },
          {
            position: "right",
            ticks: { display: false },
            gridLines: { display: false, drawTicks: false },
          },
        ],
      },
    };
  };

  getTableData = (data) => {
    const cpuData = _.get(data, "cpu", []);
    const cpuAvg = (cpuData.reduce((acc, d) => acc + d) / cpuData.length).toFixed(2);

    const launchTimeData = _.get(data, "launch_times", []);
    const launchTimeAvg = Math.floor(launchTimeData.reduce((acc, d) => acc + d) / launchTimeData.length);

    const memoryData = _.get(data, "memory", []);
    const memoryAvg = Math.floor(memoryData.reduce((acc, d) => acc + d) / memoryData.length);
    return (
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Parameter</th>
            <th>Average Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Memory Usage</td>
            <td>{memoryAvg} KB</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Launch Time</td>
            <td>{launchTimeAvg} milliseconds</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>CPU Usage</td>
            <td>{cpuAvg} CPU-seconds</td>
          </tr>
        </tbody>
      </Table>
    );
  };

  render() {
    const { apidata } = this.state;
    return (
      <div>
        <div className="text-center">
          <h2>{apidata.app_name} Test Results</h2>
        </div>
        {_.get(apidata, "test_cases", []).map((testCase, testCaseIndex) => {
          return (
            <div key={testCase.test_name}>
              <div style={{ paddingLeft: "10%", paddingRight: "10%" }}>
                <h3 className="mt-4">
                  Test {testCaseIndex + 1}: {testCase.test_name}
                </h3>
                {!_.isEmpty(testCase) &&
                  _.get(testCase, "test_steps", []).map((step, testCaseIndex) => {
                    return (
                      <div key={step.step_name} className="mt-4 mb-4">
                        <h5>
                          Step {testCaseIndex + 1}. {step.step_name}
                        </h5>
                        <div className="d-flex align-items-center">
                          <img src={mapScreenshots[step.screenshot]} alt={step.screenshot} style={{ width: "20%" }} />
                          <div style={{ width: "80%" }}>
                            <div className="d-flex">
                              <div style={{ paddingLeft: 20, width: "50%" }}>{this.getTableData(step)}</div>
                              <div style={{ paddingLeft: 20, width: "50%" }}>
                                <Line data={this.getChartData(step)} options={this.getChartOptions(step)} />
                              </div>
                            </div>
                            <div className="d-flex">
                              <div style={{ paddingLeft: 20, width: "50%" }}></div>
                              <div
                                style={{ paddingLeft: 20, width: "50%", display: "flex", justifyContent: "flex-end" }}
                              >
                                <ButtonGroup>
                                  <Button
                                    color="primary"
                                    onClick={() => this.setChartType(step.step_name, "cpu")}
                                    active={this.state.chartSelected[step.step_name] === "cpu"}
                                  >
                                    CPU Usage
                                  </Button>
                                  <Button
                                    color="primary"
                                    onClick={() => this.setChartType(step.step_name, "memory")}
                                    active={this.state.chartSelected[step.step_name] === "memory"}
                                  >
                                    Memory Usage
                                  </Button>
                                  <Button
                                    color="primary"
                                    onClick={() => this.setChartType(step.step_name, "launch_times")}
                                    active={this.state.chartSelected[step.step_name] === "launch_times"}
                                  >
                                    Launch Time
                                  </Button>
                                </ButtonGroup>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="dropdown-divider"></div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default ScreenshotData;
