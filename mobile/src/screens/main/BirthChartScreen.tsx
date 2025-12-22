// mobile/src/screens/main/BirthChartScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { useAuth } from "../../hooks/useAuth";
import { colors, zodiacColors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { sizes } from "../../theme/sizes";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";

interface PlanetInfo {
  planet: string;
  sign: string;
  degree: number;
  house: number;
}

interface BirthChartData {
  planets: Record<string, PlanetInfo>;
  current_dasha: {
    major: string;
    minor: string;
    end_date: string;
  };
  yogas: string[];
}

const BirthChartScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<BirthChartData | null>(null);

  const fetchBirthChart = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from("birth_charts")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching birth chart:", error);
      }

      if (data) {
        setChartData(data);
      } else {
        // Fallback Mock Data for demo if no chart exists
        setChartData({
          planets: {
            Sun: { planet: "Sun", sign: "Leo", degree: 14.5, house: 1 },
            Moon: { planet: "Moon", sign: "Taurus", degree: 3.2, house: 10 },
            Mars: { planet: "Mars", sign: "Aries", degree: 22.1, house: 9 },
            Mercury: {
              planet: "Mercury",
              sign: "Virgo",
              degree: 5.4,
              house: 2,
            },
            Jupiter: {
              planet: "Jupiter",
              sign: "Cancer",
              degree: 18.9,
              house: 4,
            },
            Venus: { planet: "Venus", sign: "Libra", degree: 12.3, house: 3 },
            Saturn: {
              planet: "Saturn",
              sign: "Capricorn",
              degree: 29.8,
              house: 6,
            },
            Rahu: { planet: "Rahu", sign: "Gemini", degree: 8.4, house: 11 },
            Ketu: {
              planet: "Ketu",
              sign: "Sagittarius",
              degree: 8.4,
              house: 5,
            },
          },
          current_dasha: {
            major: "Jupiter",
            minor: "Saturn",
            end_date: "2025-06-15",
          },
          yogas: ["Gaja Kesari Yoga", "Budhaditya Yoga", "Dhana Yoga"],
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthChart();
  }, []);

  const getPlanetIcon = (planet: string) => {
    // Simplified mapping
    return "planet";
  };

  const getZodiacColor = (sign: string) => {
    return (zodiacColors as any)[sign] || colors.primary;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBirthChart} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h2, styles.title]}>Vedic Birth Chart</Text>
          <Text style={[typography.body, styles.subtitle]}>
            Planetary Positions & Analysis
          </Text>
        </View>

        {/* Current Dasha */}
        {chartData?.current_dasha && (
          <View style={styles.section}>
            <Card variant="filled" style={styles.dashaCard}>
              <View style={styles.dashaHeader}>
                <Ionicons name="time" size={24} color={colors.primary} />
                <Text style={[typography.h4, { color: colors.primary }]}>
                  Current Period
                </Text>
              </View>
              <View style={styles.dashaDetails}>
                <View style={styles.dashaItem}>
                  <Text style={typography.caption}>Mahadasha</Text>
                  <Text style={typography.h3}>
                    {chartData.current_dasha.major}
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.grayMedium}
                />
                <View style={styles.dashaItem}>
                  <Text style={typography.caption}>Antardasha</Text>
                  <Text style={typography.h3}>
                    {chartData.current_dasha.minor}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  typography.caption,
                  { textAlign: "center", marginTop: spacing.md },
                ]}
              >
                Ends on{" "}
                {new Date(
                  chartData.current_dasha.end_date
                ).toLocaleDateString()}
              </Text>
            </Card>
          </View>
        )}

        {/* Planetary Positions */}
        {chartData?.planets && (
          <View style={styles.section}>
            <Text style={[typography.h4, styles.sectionTitle]}>
              Planetary Positions
            </Text>
            <View style={styles.planetGrid}>
              {Object.values(chartData.planets).map((p, index) => (
                <Card key={index} style={styles.planetCard}>
                  <View style={styles.planetHeader}>
                    <Text style={[typography.body, { fontWeight: "600" }]}>
                      {p.planet}
                    </Text>
                    <Badge
                      label={`H${p.house}`}
                      size="sm"
                      variant="info"
                      style={{
                        backgroundColor: colors.bgSecondary,
                        alignSelf: "center",
                      }}
                    />
                  </View>
                  <View style={styles.planetDetail}>
                    <View
                      style={[
                        styles.signDot,
                        { backgroundColor: getZodiacColor(p.sign) },
                      ]}
                    />
                    <Text style={typography.bodySmall}>{p.sign}</Text>
                  </View>
                  <Text
                    style={[typography.caption, { color: colors.textTertiary }]}
                  >
                    {p.degree}°
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Yogas / Special Combinations */}
        {chartData?.yogas && chartData.yogas.length > 0 && (
          <View style={styles.section}>
            <Text style={[typography.h4, styles.sectionTitle]}>
              Special Yogas
            </Text>
            <View style={styles.yogaContainer}>
              {chartData.yogas.map((yoga, idx) => (
                <View key={idx} style={styles.yogaItem}>
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={typography.body}>{yoga}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  dashaCard: {
    backgroundColor: colors.infoLight,
    padding: spacing.xl,
  },
  dashaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dashaDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  dashaItem: {
    alignItems: "center",
  },
  planetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  planetCard: {
    width: "30%",
    padding: spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  planetHeader: {
    alignItems: "center",
    width: "100%",
  },
  planetDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  signDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  yogaContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: sizes.radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  yogaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});

export default BirthChartScreen;
