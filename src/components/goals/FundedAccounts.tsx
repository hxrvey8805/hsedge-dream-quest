import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign } from "lucide-react";

export const FundedAccounts = () => {
  const accounts = [
    { company: "Topstep", accountSize: "100K", fundedAccts: 1, fundedAcctGoal: 5 }
  ];

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          FUNDED
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Acct. Size/Type</TableHead>
              <TableHead>Funded Accts.</TableHead>
              <TableHead>Funded Acct. Goal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account, i) => (
              <TableRow key={i}>
                <TableCell>{account.company}</TableCell>
                <TableCell>{account.accountSize}</TableCell>
                <TableCell>{account.fundedAccts}</TableCell>
                <TableCell>{account.fundedAcctGoal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
