import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from "@/hooks/useCampaigns";

// Define the data type for your campaign data
interface Campaign {
  id: string;
  title: string;
  status: string;
  progress: number;
  totalCalls: number;
  answeredCalls: number;
  transferredCalls: number;
  failedCalls: number;
}

// Mock campaign data (replace with your actual data source)
const data: Campaign[] = [
  {
    id: "1",
    title: "Summer Campaign",
    status: "running",
    progress: 60,
    totalCalls: 1000,
    answeredCalls: 600,
    transferredCalls: 150,
    failedCalls: 50,
  },
  {
    id: "2",
    title: "Winter Promotion",
    status: "paused",
    progress: 25,
    totalCalls: 500,
    answeredCalls: 125,
    transferredCalls: 30,
    failedCalls: 10,
  },
  {
    id: "3",
    title: "Spring Sale",
    status: "completed",
    progress: 100,
    totalCalls: 2000,
    answeredCalls: 1900,
    transferredCalls: 400,
    failedCalls: 20,
  },
  {
    id: "4",
    title: "Autumn Special",
    status: "failed",
    progress: 0,
    totalCalls: 300,
    answeredCalls: 0,
    transferredCalls: 0,
    failedCalls: 300,
  },
];

// Function to determine the badge color based on status
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'running':
      return <Badge variant="success">Running</Badge>;
    case 'paused':
      return <Badge variant="secondary">Paused</Badge>; // Changed from "warning" to "secondary"
    case 'completed':
      return <Badge variant="outline">Completed</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>; // Changed from "warning" to "secondary" if it was using "warning"
  }
};

export function CampaignTable() {
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const progress = row.getValue("progress") as number;
        return `${progress}%`;
      },
    },
    {
      accessorKey: "totalCalls",
      header: "Total Calls",
    },
    {
      accessorKey: "answeredCalls",
      header: "Answered Calls",
    },
    {
      accessorKey: "transferredCalls",
      header: "Transferred Calls",
    },
    {
      accessorKey: "failedCalls",
      header: "Failed Calls",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const campaign = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: campaigns || [], // Use campaigns data from the hook
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
