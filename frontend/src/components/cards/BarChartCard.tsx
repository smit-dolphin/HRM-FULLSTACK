import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartData[];
  color?: string;
  height?: number;
  showGrid?: boolean;
}

export default function BarChartCard({
  title,
  data,
  color = "#3b82f6",
  height = 300,
  showGrid = true,
}: BarChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                />
              )}

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                fill={color}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}