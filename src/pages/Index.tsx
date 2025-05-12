import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BusinessListing } from "@/types/supabase";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FeaturedListings from "@/components/FeaturedListings";
import CategorySection from "@/components/CategorySection";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<BusinessListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("business_listings")
          .select("*")
          .eq("is_published", true)
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) {
          throw error;
        }

        setFeaturedListings(data as BusinessListing[]);
      } catch (error) {
        console.error("Error fetching featured listings:", error);
        toast({
          title: "Error",
          description: "Failed to load featured listings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedListings();

    // Set up realtime subscription for business_listings
    const channel = supabase.channel('public:business_listings')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'business_listings' 
        },
        (payload) => {
          // Refresh the listings when there's a change
          fetchFeaturedListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return (
    <Layout>
      <Helmet>
        <title>Empire Market - Buy and Sell Businesses</title>
        <meta
          name="description"
          content="Find the perfect business to buy or sell your business on Empire Market. Browse featured listings, connect with buyers and sellers, and make your next business move."
        />
      </Helmet>

      <Hero />

      <FeaturedListings
        listings={featuredListings}
        isLoading={isLoading}
        userId={user?.id}
      />

      <CategorySection />

      <HowItWorks />

      <Testimonials />

      <CallToAction
        title="Ready to sell your business?"
        description="List your business on Empire Market and connect with thousands of potential buyers."
        action={
          <Link to="/submit">
            <Button size="lg" className="mt-6">
              List Your Business
            </Button>
          </Link>
        }
      />
    </Layout>
  );
};

export default Index;
