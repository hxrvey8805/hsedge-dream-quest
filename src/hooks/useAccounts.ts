import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Account {
  id: string;
  company: string;
  account_size: string;
  displayName: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch funded accounts
    const { data: fundedData, error: fundedError } = await supabase
      .from("funded_accounts")
      .select("id, company, account_size")
      .eq("user_id", user.id);

    // Fetch evaluations
    const { data: evalData, error: evalError } = await supabase
      .from("evaluations")
      .select("id, company, account_size")
      .eq("user_id", user.id);

    const allAccounts: Account[] = [];

    if (!fundedError && fundedData) {
      fundedData.forEach(acc => {
        allAccounts.push({
          id: acc.id,
          company: acc.company,
          account_size: acc.account_size,
          displayName: `${acc.company} - ${acc.account_size}`
        });
      });
    }

    if (!evalError && evalData) {
      evalData.forEach(acc => {
        allAccounts.push({
          id: acc.id,
          company: acc.company,
          account_size: acc.account_size,
          displayName: `${acc.company} - ${acc.account_size} (Eval)`
        });
      });
    }

    setAccounts(allAccounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();

    // Subscribe to realtime changes
    const fundedChannel = supabase
      .channel('funded-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'funded_accounts',
        },
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

    const evalChannel = supabase
      .channel('evaluations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluations',
        },
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(fundedChannel);
      supabase.removeChannel(evalChannel);
    };
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    fetchAccounts,
  };
};
