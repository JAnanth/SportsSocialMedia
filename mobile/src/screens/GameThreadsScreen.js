import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { gameThreadsService } from '../services/gameThreadsService';
import { teamsService } from '../services/teamsService';

const GameThreadsScreen = ({ navigation }) => {
  const [gameThreads, setGameThreads] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserTeams();
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      loadGameThreads();
    }
  }, [selectedTeamId, teams]);

  const loadUserTeams = async () => {
    try {
      const userTeams = await teamsService.getUserFavoriteTeams();
      setTeams(userTeams);
      if (userTeams.length > 0) {
        setSelectedTeamId(userTeams[0].id);
      }
    } catch (error) {
      console.error('Load teams error:', error);
    }
  };

  const loadGameThreads = async () => {
    try {
      const params = selectedTeamId ? { teamId: selectedTeamId } : {};
      const threads = await gameThreadsService.getGameThreads(params);
      setGameThreads(threads);
    } catch (error) {
      console.error('Load game threads error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGameThreads();
  }, [selectedTeamId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#007AFF';
      case 'live':
        return '#28a745';
      case 'completed':
        return '#666';
      default:
        return '#999';
    }
  };

  const renderGameThread = ({ item }) => {
    const isHomeTeam = item.team_id === selectedTeamId;
    const homeTeam = isHomeTeam ? item.team_name : item.opponent_name;
    const awayTeam = isHomeTeam ? item.opponent_name : item.team_name;
    const gameDate = new Date(item.game_date);

    return (
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => navigation.navigate('GameThreadDetail', { gameThreadId: item.id })}
      >
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.gameInfo}>
          <View style={styles.matchup}>
            <View style={styles.teamRow}>
              <Text style={styles.teamLabel}>Away:</Text>
              <Text style={styles.teamName}>{awayTeam}</Text>
              {item.status === 'completed' && (
                <Text style={styles.score}>{item.away_score}</Text>
              )}
            </View>
            <View style={styles.teamRow}>
              <Text style={styles.teamLabel}>Home:</Text>
              <Text style={styles.teamName}>{homeTeam}</Text>
              {item.status === 'completed' && (
                <Text style={styles.score}>{item.home_score}</Text>
              )}
            </View>
          </View>

          <View style={styles.gameFooter}>
            <Text style={styles.gameDate}>
              {gameDate.toLocaleDateString()} {gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.postCount}>{item.post_count || 0} posts</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Game Threads</Text>
      </View>

      <View style={styles.teamSelector}>
        <TouchableOpacity
          style={[styles.teamChip, !selectedTeamId && styles.teamChipActive]}
          onPress={() => setSelectedTeamId(null)}
        >
          <Text style={[styles.teamChipText, !selectedTeamId && styles.teamChipTextActive]}>
            All Teams
          </Text>
        </TouchableOpacity>
        {teams.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={[styles.teamChip, selectedTeamId === team.id && styles.teamChipActive]}
            onPress={() => setSelectedTeamId(team.id)}
          >
            <Text style={[styles.teamChipText, selectedTeamId === team.id && styles.teamChipTextActive]}>
              {team.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={gameThreads}
        renderItem={renderGameThread}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No game threads yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  teamSelector: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  teamChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  teamChipActive: {
    backgroundColor: '#007AFF',
  },
  teamChipText: {
    fontSize: 14,
    color: '#666',
  },
  teamChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 12,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gameInfo: {
    gap: 12,
  },
  matchup: {
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamLabel: {
    fontSize: 14,
    color: '#666',
    width: 50,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  gameDate: {
    fontSize: 14,
    color: '#666',
  },
  postCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default GameThreadsScreen;
