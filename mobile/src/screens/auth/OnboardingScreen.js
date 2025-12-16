import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { teamsService } from '../../services/teamsService';
import { useAuth } from '../../context/AuthContext';

const OnboardingScreen = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const teamsData = await teamsService.getAllTeams({ league: 'NFL' });
      setTeams(teamsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamSelection = (team) => {
    if (selectedTeams.find((t) => t.id === team.id)) {
      setSelectedTeams(selectedTeams.filter((t) => t.id !== team.id));
    } else {
      if (selectedTeams.length >= 5) {
        Alert.alert('Limit Reached', 'You can select up to 5 teams');
        return;
      }
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const handleContinue = async () => {
    if (selectedTeams.length === 0) {
      Alert.alert('No Teams Selected', 'Please select at least one team');
      return;
    }

    setSaving(true);
    try {
      for (let i = 0; i < selectedTeams.length; i++) {
        const team = selectedTeams[i];
        await teamsService.addFavoriteTeam(
          team.id,
          i === 0 ? 5 : 3,
          i + 1
        );
      }
      await refreshUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to save teams');
    } finally {
      setSaving(false);
    }
  };

  const renderTeamItem = ({ item }) => {
    const isSelected = selectedTeams.find((t) => t.id === item.id);
    const selectionIndex = selectedTeams.findIndex((t) => t.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.teamCard, isSelected && styles.teamCardSelected]}
        onPress={() => toggleTeamSelection(item)}
      >
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <Text style={styles.teamCity}>{item.city}</Text>
        </View>
        {isSelected && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectionIndex + 1}</Text>
          </View>
        )}
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
        <Text style={styles.title}>Choose Your Teams</Text>
        <Text style={styles.subtitle}>
          Select 1-5 teams you want to follow
        </Text>
        <Text style={styles.selectedCount}>
          {selectedTeams.length}/5 selected
        </Text>
      </View>

      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (selectedTeams.length === 0 || saving) && styles.buttonDisabled,
        ]}
        onPress={handleContinue}
        disabled={selectedTeams.length === 0 || saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  selectedCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  teamCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  teamCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  teamCity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    margin: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
