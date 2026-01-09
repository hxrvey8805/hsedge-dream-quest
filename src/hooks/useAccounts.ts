import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Account {
  id: string;
  company: string;
  account_size: string;
  displayName: string;
  running_pl: number;
  type: 'personal' | 'funded' | 'evaluation' | 'backtesting';
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch personal accounts
    const { data: personalData } = await supabase
      .from("personal_accounts")
      .select("id, account_name, account_size, running_pl")
      .eq("user_id", user.id);

    // Fetch funded accounts
    const { data: fundedData } = await supabase
      .from("funded_accounts")
      .select("id, company, account_size, running_pl")
      .eq("user_id", user.id);

    // Fetch evaluations
    const { data: evalData } = await supabase
      .from("evaluations")
      .select("id, company, account_size, running_pl")
      .eq("user_id", user.id);

    // Fetch backtesting sessions
    const { data: backtestData } = await supabase
      .from("backtesting_sessions")
      .select("id, session_name, starting_balance, running_pl")
      .eq("user_id", user.id);

    const allAccounts: Account[] = [];

    if (personalData) {
      personalData.forEach(acc => {
        allAccounts.push({
          id: acc.id,
          company: "Personal",
          account_size: `$${acc.account_size}`,
          displayName: acc.account_name,
          running_pl: acc.running_pl || 0,
          type: 'personal'
        });
      });
    }

    if (fundedData) {
      fundedData.forEach(acc => {
        allAccounts.push({
          id: acc.id,
          company: acc.company,
          account_size: acc.account_size,
          displayName: `${acc.company} - ${acc.account_size}`,
          running_pl: acc.running_pl || 0,
          type: 'funded'
        });
      });
    }

    if (evalData) {
      evalData.forEach(acc => {
        allAccounts.push({
          id: acc.id,
          company: acc.company,
          account_size: acc.account_size,
          displayName: `${acc.company} - ${acc.account_size} (Eval)`,
          running_pl: acc.running_pl || 0,
          type: 'evaluation'
        });
      });
    }

    if (backtestData) {
      backtestData.forEach(acc => {
        allAccounts.push({
          id: acc.id,
          company: "Backtest",
          account_size: `$${acc.starting_balance}`,
          displayName: `${acc.session_name} (Backtest)`,
          running_pl: acc.running_pl || 0,
          type: 'backtesting'
        });
      });
    }

    setAccounts(allAccounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();

    // Subscribe to realtime changes
    const personalChannel = supabase
      .channel('personal-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_accounts',
        },
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

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

    const backtestChannel = supabase
      .channel('backtesting-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'backtesting_sessions',
        },
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(personalChannel);
      supabase.removeChannel(fundedChannel);
      supabase.removeChannel(evalChannel);
      supabase.removeChannel(backtestChannel);
    };
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    fetchAccounts,
  };
};
