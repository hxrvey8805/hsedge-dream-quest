import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp } from "lucide-react";

export const Evaluations = () => {
  const evaluations = [
    { 
      company: "Topstep", 
      accountSize: "50K", 
      runningPL: "$1,250.00", 
      profitTarget: "$3,000.00",
      progress: "41.67%"
    }
  ];

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          EVALUATIONS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Acct. Size/Type</TableHead>
              <TableHead>Running P&L</TableHead>
              <TableHead>Profit Target</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((evaluation, i) => (
              <TableRow key={i}>
                <TableCell>{evaluation.company}</TableCell>
                <TableCell>{evaluation.accountSize}</TableCell>
                <TableCell>{evaluation.runningPL}</TableCell>
                <TableCell>{evaluation.profitTarget}</TableCell>
                <TableCell>{evaluation.progress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
