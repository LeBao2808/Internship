
export const monthLabels = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    y: { beginAtZero: true },
  },
};

interface DatasetProps {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderRadius: number;
}

export const getBarChartData = (
  labels: string[],
  data: number[],
  label: string,
  colorPattern: string[]
) => {
  return {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: Array(12).fill("").map(
          (_, i) => colorPattern[i % colorPattern.length]
        ),
        borderRadius: 8,
      },
    ],
  };
};