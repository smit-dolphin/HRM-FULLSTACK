import { fetchHolidaysService } from "@/services/holidayService/holidayService";
import { queryOptions } from "@tanstack/react-query";

export const fetchHolidaysOption =
queryOptions({
        queryKey: ['holidays'],
        queryFn: () => fetchHolidaysService(),
})