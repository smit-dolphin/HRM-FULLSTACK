import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ArrowUpRight, type LucideProps } from 'lucide-react'


interface KapiPropes{
  item:{

      label: string;
    value: string;
    delta: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    tone: string;
    }
 
}
const KpiCard = ({item}:KapiPropes) => {
  return (
    <div>
        <Card key={item.label} className="border-slate-200/70 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{item.label}</CardTitle>
              <item.icon className={`h-5 w-5 ${item.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {item.delta} from last month
              </div>
            </CardContent>
          </Card>
    </div>
  )
}

export default KpiCard