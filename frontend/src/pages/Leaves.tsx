import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const leaveRequests = [
  {
    id: 'LR-001',
    employee: 'John Smith',
    type: 'Sick Leave',
    startDate: '2023-11-15',
    endDate: '2023-11-16',
    status: 'Approved',
    days: 2,
  },
  {
    id: 'LR-002',
    employee: 'Alice Johnson',
    type: 'Annual Leave',
    startDate: '2023-12-20',
    endDate: '2023-12-31',
    status: 'Pending',
    days: 8,
  },
  {
    id: 'LR-003',
    employee: 'Charlie Davis',
    type: 'Personal',
    startDate: '2023-10-05',
    endDate: '2023-10-05',
    status: 'Rejected',
    days: 1,
  }
];

export function Leaves() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">Approve or reject employee leave requests.</p>
        </div>
        <Button>Request Leave</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">3</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Review and manage recent employee leave requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.employee}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>
                    {request.startDate} to {request.endDate}
                  </TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1.5 text-sm ${
                      request.status === 'Approved' ? 'text-green-600' :
                      request.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {request.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                      {request.status === 'Rejected' && <XCircle className="w-4 h-4" />}
                      {request.status === 'Pending' && <Clock className="w-4 h-4" />}
                      {request.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">Approve</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Reject</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
