import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DonutChartItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  centerTitle?: string;
  centerValue?: string | number;
  data: DonutChartItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

export default function DonutChart({
  title,
  centerTitle,
  centerValue,
  data,
  height = 280,
  innerRadius = 75,
  outerRadius = 95,
  showLegend = true,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>

        <div
          className="relative"
          style={{ height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={3}
                strokeWidth={3}
              >
                {data.map((item) => (
                  <Cell
                    key={item.name}
                    fill={item.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-3xl font-bold">
              {centerValue ?? total}
            </p>

            <p className="text-sm text-muted-foreground">
              {centerTitle ?? "Total"}
            </p>
          </div>
        </div>

        {showLegend && (
          <div className="mt-6 space-y-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="text-sm">
                    {item.name}
                  </span>
                </div>

                <span className="font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}