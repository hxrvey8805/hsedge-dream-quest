import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PLANS = {
  monthly: {
    price_id: "price_1TEpCQGy16OK5lK5g4QNexyY",
    product_id: "prod_UDFhqSjFYJA9g7",
    name: "Monthly",
    price: 19,
    interval: "month" as const,
  },
  yearly: {
    price_id: "price_1TEzwaGy16OK5lK5mwvr2EXm",
    product_id: "prod_UDQownAkW0VY00",
    name: "Yearly",
    price: 12,
    interval: "year" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  planKey: PlanKey | null;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    loading: true,
    planKey: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState({ subscribed: false, productId: null, subscriptionEnd: null, loading: false, planKey: null });
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      const planKey = data?.product_id === PLANS.monthly.product_id
        ? "monthly"
        : data?.product_id === PLANS.yearly.product_id
          ? "yearly"
          : null;

      setState({
        subscribed: data?.subscribed ?? false,
        productId: data?.product_id ?? null,
        subscriptionEnd: data?.subscription_end ?? null,
        loading: false,
        planKey,
      });
    } catch (err) {
      console.error("Error checking subscription:", err);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const createCheckout = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const openCustomerPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
