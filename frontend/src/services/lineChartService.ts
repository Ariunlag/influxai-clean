import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  CategoryScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  TimeScale,  // 🗝️ fixes "time" scale error!
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export function createLineChartConfig(
  seriesList: TimeseriesData[],
  colors: string[] = ["#36a2eb", "#ff6384", "#ffcd56"]
): { data: ChartData<"line">; options: ChartOptions<"line"> } {
  const datasets = seriesList
    .filter((s) => s.points.length > 0)
    .map((s, idx) => ({
      label: s.measurement,
      data: s.points.map((p) => ({
        x: new Date(p.time).getTime(), 
        y: Number(p.value),              
        tags: p.tags,
      })),
      borderWidth: 2,
      borderColor: colors[idx % colors.length],
      fill: false,
      spanGaps: true,
      pointRadius: 1, 
      pointHoverRadius: 4,                    
    }));

  return {
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const point = ctx.raw as any;
              const tags = point.tags
                ? Object.entries(point.tags)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")
                : "No tags";
              return `Value: ${point.y}\nTags: ${tags}\nTime: ${new Date(point.x).toISOString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: { unit: "minute" },
          ticks: { color: "#bbb" },
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#bbb" },
        },
      },
    },
  };
}
