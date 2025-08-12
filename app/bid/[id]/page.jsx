"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Bot,
  MessageCircle,
  BarChart3,
  Clock,
  DollarSign,
  Plus,
  Minus,
  RotateCcw,
  Loader2,
  Activity,
  Target,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// UI Components
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";

import {
  incrementPrice,
  decrementPrice,
  formatPrice,
  PRICING_CONFIG,
} from "../../utils/pricing";

// Enhanced OrderPanel component
function OrderPanel({ market, balance, setBalance, onOrderPlaced, clerkUser }) {
  const [selectedOption, setSelectedOption] = useState("YES");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const yesPrice = market?.yesPrice || 5;
  const noPrice = 10 - yesPrice;

  const getCurrentPrice = () => {
    if (customPrice !== null) return customPrice;
    return selectedOption === "YES" ? yesPrice : noPrice;
  };

  const currentPrice = getCurrentPrice();
  const cost = currentPrice * quantity;
  const potentialReturn = quantity * PRICING_CONFIG.MAX_PAYOUT;

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setCustomPrice(null);
  };

  const handleIncreasePrice = () => {
    const newPrice = incrementPrice(currentPrice);
    setCustomPrice(newPrice);
  };

  const handleDecreasePrice = () => {
    const newPrice = decrementPrice(currentPrice);
    setCustomPrice(newPrice);
  };

  const handlePlaceOrder = async () => {
    if (!market) return;

    if (cost <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (cost > balance) {
      toast.error("Insufficient balance to place this order");
      return;
    }

    if (!clerkUser?.id) {
      toast.error("Please sign in to place orders");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        bidId: market.id,
        clerkId: clerkUser.id,
        optionKey: selectedOption === "YES" ? "Yes" : "No",
        price: currentPrice,
        quantity: quantity,
      };

      console.log("Placing order with data:", orderData);

      const orderResponse = await fetch("http://localhost:5500/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      // Check if response is actually JSON
      const contentType = orderResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await orderResponse.text();
        console.error("Non-JSON response:", responseText);
        throw new Error("Server returned non-JSON response");
      }

      const orderResult = await orderResponse.json();
      console.log("Order response:", orderResult);

      if (orderResponse.ok) {
        // Update balance from the response
        if (orderResult.remainingBalance !== undefined) {
          setBalance(orderResult.remainingBalance);
        }

        const optionText = selectedOption === "YES" ? "Yes" : "No";
        const priceType = customPrice !== null ? "custom" : "market";

        // Enhanced success toast with more details
        toast.success("Order Placed Successfully!", {
          description: `${quantity} ${optionText} share${
            quantity > 1 ? "s" : ""
          } @ ₹${currentPrice.toFixed(2)} each • Total: ₹${cost.toFixed(2)}`,
          duration: 6000,
        });

        // Call the order placed handler (remove duplicate toast from there)
        onOrderPlaced?.();

        // Reset form
        setQuantity(1);
        setCustomPrice(null);
      } else {
        const errorMsg = orderResult.error || "Failed to place order";
        toast.error(`❌ Order Failed: ${errorMsg}`, {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);

      if (error.message.includes("non-JSON response")) {
        toast.error("🚫 Server Error", {
          description: "Please check if the backend is running on port 5500.",
          duration: 5000,
        });
      } else if (
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        toast.error("🔌 Connection Error", {
          description:
            "Cannot connect to server. Please check if the backend is running.",
          duration: 5000,
        });
      } else {
        toast.error("⚠️ Network Error", {
          description: "Please try again in a moment.",
          duration: 4000,
        });
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!market) {
    return (
      <Card className="h-96">
        <CardContent className="flex justify-center items-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading order panel...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Target className="h-5 w-5" />
          Place Your Bet
        </CardTitle>
        <CardDescription>
          Choose your prediction and stake amount
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Authentication Alert */}
        {!clerkUser?.id && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Please sign in to place orders</AlertDescription>
          </Alert>
        )}

        {/* YES/NO Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedOption === "YES" ? "default" : "outline"}
            onClick={() => handleOptionChange("YES")}
            className={`h-14 ${
              selectedOption === "YES"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "border-green-200 text-green-600 hover:bg-green-50"
            }`}
            disabled={isPlacingOrder}
          >
            <div className="flex flex-col items-center">
              <span className="font-bold">YES</span>
              <span className="text-xs">₹{formatPrice(yesPrice)}</span>
            </div>
          </Button>

          <Button
            variant={selectedOption === "NO" ? "default" : "outline"}
            onClick={() => handleOptionChange("NO")}
            className={`h-14 ${
              selectedOption === "NO"
                ? "bg-red-400 hover:bg-red-500 text-white"
                : "border-red-200 text-red-400 hover:bg-red-50"
            }`}
            disabled={isPlacingOrder}
          >
            <div className="flex flex-col items-center">
              <span className="font-bold">NO</span>
              <span className="text-xs">₹{formatPrice(noPrice)}</span>
            </div>
          </Button>
        </div>

        {/* Price Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Price</label>
              {customPrice !== null && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Custom
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDecreasePrice}
                disabled={
                  currentPrice <= PRICING_CONFIG.MIN_PRICE || isPlacingOrder
                }
                aria-label="Decrease price"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <div className="px-4 py-2 bg-muted rounded-md min-w-[80px] text-center font-mono">
                ₹{formatPrice(currentPrice)}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleIncreasePrice}
                disabled={
                  currentPrice >= PRICING_CONFIG.MAX_PRICE || isPlacingOrder
                }
                aria-label="Increase price"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isPlacingOrder}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </Button>

              <div className="px-4 py-2 bg-muted rounded-md min-w-[60px] text-center font-mono">
                {quantity}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={isPlacingOrder}
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Price increment info */}
          <p className="text-xs text-muted-foreground text-center">
            Price adjusts in ₹{formatPrice(PRICING_CONFIG.PRICE_INCREMENT)}{" "}
            increments
          </p>

          {/* Reset to market price */}
          {customPrice !== null && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomPrice(null)}
                className="text-xs"
                disabled={isPlacingOrder}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to market price
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>You pay:</span>
            <span className="font-bold">₹{cost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>You Get (after 10% fee):</span>
            <span className="font-bold text-green-600">
              ₹{(cost + (potentialReturn - cost) * 0.9).toFixed(2)}
            </span>
          </div>

          {customPrice !== null && (
            <p className="text-xs text-muted-foreground">
              Using custom price (Market: ₹
              {formatPrice(selectedOption === "YES" ? yesPrice : noPrice)})
            </p>
          )}
        </div>

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          className="w-full h-12 text-lg font-bold"
          disabled={cost > balance || !clerkUser?.id || isPlacingOrder}
          size="lg"
        >
          {isPlacingOrder ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : !clerkUser?.id ? (
            "Sign In Required"
          ) : cost > balance ? (
            "Insufficient Balance"
          ) : (
            `Place Order @ ₹${cost.toFixed(2)}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Enhanced AI Results Card
function AIResultsCard({ result }) {
  const getWinnerColor = (winner) => {
    if (winner === "A") return "text-green-600";
    if (winner === "B") return "text-amber-600";
    return "text-gray-600";
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { text: "High", variant: "default" };
    if (confidence >= 0.6) return { text: "Medium", variant: "secondary" };
    return { text: "Low", variant: "destructive" };
  };

  const confidenceInfo = getConfidenceLevel(result.confidence);

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              AI Prediction
            </label>
            <Badge
              variant="outline"
              className={`w-full justify-center py-2 ${getWinnerColor(
                result.winner
              )}`}
            >
              {result.winner === "Tie"
                ? "Too Close to Call"
                : result.winner === "A"
                ? result.optionA
                : result.optionB}
            </Badge>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Confidence
            </label>
            <div className="space-y-2">
              <Badge
                variant={confidenceInfo.variant}
                className="w-full justify-center py-2"
              >
                {confidenceInfo.text} ({Math.round(result.confidence * 100)}%)
              </Badge>
              <Progress value={result.confidence * 100} className="h-2" />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h5 className="font-medium mb-3 flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Reasoning
          </h5>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.reasoning}
          </p>
        </div>

        {result.market_insights && result.market_insights.length > 0 && (
          <>
            <Separator />
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Market Insights
              </h5>
              <ul className="space-y-2">
                {result.market_insights.map((insight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Loading skeleton for market data
function MarketSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="w-72 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BidPage() {
  const { id } = useParams();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [market, setMarket] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [balance, setBalance] = useState(1000);
  const [message, setMessage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const mount = useRef(false);

  // Fetch user balance from backend when user is loaded
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!userLoaded || !clerkUser?.id) return;

      try {
        const response = await fetch(
          `http://localhost:5500/api/get/user/${clerkUser.id}`
        );
        const data = await response.json();

        if (response.ok && data.user) {
          setBalance(data.user.balance);
        } else {
          const createResponse = await fetch(
            "http://localhost:5500/api/create-user",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: clerkUser.id,
                name: clerkUser.fullName || clerkUser.firstName || "User",
                email: clerkUser.primaryEmailAddress?.emailAddress || "",
              }),
            }
          );

          const createData = await createResponse.json();
          if (createResponse.ok && createData.user) {
            setBalance(createData.user.balance);
          }
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
        toast.error("Failed to load user balance");
      }
    };

    fetchUserBalance();
  }, [userLoaded, clerkUser?.id]);

  useEffect(() => {
    mount.current = true;

    async function loadData() {
      setLoadingMarket(true);
      try {
        const response = await fetch(`http://localhost:5500/api/get/bid/${id}`);
        const data = await response.json();

        if (mount.current && data.bid) {
          const transformedMarket = {
            id: data.bid._id,
            title: data.bid.question,
            category: data.bid.category,
            yesPrice: data.bid.yesPrice,
            volume: data.bid.volume,
            endTime: data.bid.endTime,
            image: data.bid.image,
            createdAt: data.bid.createdAt,
            updatedAt: data.bid.updatedAt,
            deadline:
              new Date(data.bid.endTime) > new Date()
                ? `Ends ${new Date(data.bid.endTime).toLocaleDateString()}`
                : "Expired",
            context: `Market analysis for ${data.bid.category.toLowerCase()} prediction`,
            marketNews: `Current Yes price: ₹${data.bid.yesPrice}, Volume: ₹${data.bid.volume}`,
            optionA: "Yes",
            optionB: "No",
          };
          setMarket(transformedMarket);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (mount.current) {
          toast.error("Failed to load market data");
        }
      } finally {
        if (mount.current) setLoadingMarket(false);
      }
    }

    loadData();

    return () => {
      mount.current = false;
    };
  }, [id]);

  const runAi = async () => {
    if (!market) return;

    setAiLoading(true);
    setAiResult(null);

    try {
      const payload = {
        question: market.title,
        optionA: market.optionA,
        optionB: market.optionB,
        context: market.context || "",
        marketNews: market.marketNews || "",
      };

      const res = await fetch("/api/gemini/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      let data = j?.data ?? j;

      if (j?.ok && j?.data) data = j.data;
      if (!data && j?.raw) {
        try {
          data = typeof j.raw === "string" ? JSON.parse(j.raw) : j.raw;
        } catch {
          data = null;
        }
      }

      setAiResult(data || j);
      toast.success("AI analysis completed!");
    } catch (e) {
      setAiResult({ error: "AI request failed" });
      toast.error("Failed to run AI analysis");
    } finally {
      setAiLoading(false);
    }
  };

  const handleOrderPlaced = () => {
    // Remove the duplicate toast from here since it's already in handlePlaceOrder
    // Just refresh market data or perform other actions after order placement
    console.log("Order placed successfully - refreshing data if needed");
  };

  // Add this new function for claiming reward
  const handleClaimReward = async () => {
    if (!clerkUser?.id) {
      toast.error("Please sign in to claim reward");
      return;
    }

    setIsClaimingReward(true);

    try {
      const response = await fetch("http://localhost:5500/api/claim-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: clerkUser.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setBalance(data.newBalance);
        toast.success("🎉 Reward Claimed!", {
          description: `You've received ₹500! Your new balance is ₹${data.newBalance}`,
          duration: 5000,
        });
      } else {
        toast.error(`Failed to claim reward: ${data.error}`, {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Network error. Please try again.", {
        duration: 4000,
      });
    } finally {
      setIsClaimingReward(false);
    }
  };

  if (loadingMarket) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto pt-16 pb-6 px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MarketSkeleton />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto pt-16 pb-6 px-4 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">
                      {market?.category}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold mb-4">
                      {market?.title}
                    </h1>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {market?.deadline}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        Yes: ₹{market?.yesPrice}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        No: ₹{market ? (10 - market.yesPrice).toFixed(2) : "—"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <BarChart3 className="h-3 w-3" />
                        Vol: ₹{(market?.volume ?? 0).toLocaleString()}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground">{market?.context}</p>
                  </div>

                  {/* Updated Balance section */}
                  <Card className="w-full lg:w-72">
                    <CardContent className="p-4 text-center space-y-3">
                      {clerkUser?.id && (
                        <div className="text-sm text-muted-foreground">
                          Hi, {clerkUser.firstName || "User"}
                        </div>
                      )}

                      <div className="text-2xl font-bold">
                        ₹{balance.toFixed(2)}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {clerkUser?.id
                          ? "is your remaining balance"
                          : "is your demo balance"}
                      </div>

                      {/* Claim Reward Button - only show if balance is 0 and user is signed in */}
                      {clerkUser?.id && balance === 0 && (
                        <Button
                          onClick={handleClaimReward}
                          disabled={isClaimingReward}
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
                        >
                          {isClaimingReward ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>🎁 Claim Your Reward!</>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different sections - Market News first */}
            <Tabs defaultValue="market-news" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="market-news"
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Market News
                </TabsTrigger>
                <TabsTrigger
                  value="ai-analysis"
                  className="flex items-center gap-2"
                >
                  <Bot className="h-4 w-4" />
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="discussion"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discussion
                </TabsTrigger>
              </TabsList>

              <TabsContent value="market-news">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Market News
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {market?.marketNews || "No recent market news available."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Realtime AI Market Analysis
                      </CardTitle>
                      <Button
                        onClick={runAi}
                        disabled={aiLoading}
                        className="flex items-center gap-2"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4" />
                            Run AI Analysis
                          </>
                        )}
                      </Button>
                    </div>
                    <CardDescription>
                      Get AI-powered predictions and insights for this market
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiResult && !aiResult.error && (
                      <AIResultsCard result={aiResult} />
                    )}
                    {aiResult?.error && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          Failed to analyze: {aiResult.error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {!aiResult && !aiLoading && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          Click "Run AI Analysis" to get AI-powered predictions
                          for this market
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Discussion & Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      Discuss with other people using comments. (Coming Soon...)
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Order panel and stats */}
          <aside className="space-y-6">
            {/* Order Panel */}
            <OrderPanel
              market={market}
              balance={balance}
              setBalance={setBalance}
              onOrderPlaced={handleOrderPlaced}
              clerkUser={clerkUser}
            />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Market ID</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {market?.id?.slice(-8) ?? id}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Yes Price</span>
                  <Badge className="bg-green-100 text-green-800">
                    ₹{market?.yesPrice ?? "—"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>No Price</span>
                  <Badge className="bg-red-100 text-red-800">
                    ₹{market ? (10 - market.yesPrice).toFixed(2) : "—"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Volume</span>
                  <span className="font-semibold">
                    ₹{(market?.volume ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Expires</span>
                  <Badge variant="outline" className="text-orange-600">
                    {market?.deadline ?? "—"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Market created</span>
                  <span className="text-muted-foreground">
                    {market?.createdAt
                      ? new Date(market.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Last updated</span>
                  <span className="text-muted-foreground">
                    {market?.updatedAt
                      ? new Date(market.updatedAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Current volume</span>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    ₹{market?.volume ?? 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Upcoming Bids Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest betting activity on this market
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U{i + 1}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={i % 2 === 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {i % 2 === 0 ? "YES" : "NO"}
                        </Badge>
                        <span className="text-sm font-medium">
                          ₹{(i + 1) * 75}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        user{i + 1}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
