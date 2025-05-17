
import * as SQLite from 'expo-sqlite';
import { format } from 'date-fns';

// Open or create the database
const db = SQLite.openDatabase('jogging.db');

// Initialize the database with required tables
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create runs table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          duration INTEGER,
          distance REAL,
          avg_speed REAL,
          calories INTEGER
        )`,
        [],
        () => {
          // Create route_points table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS route_points (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              run_id INTEGER,
              latitude REAL,
              longitude REAL,
              timestamp INTEGER,
              speed REAL,
              FOREIGN KEY (run_id) REFERENCES runs (id) ON DELETE CASCADE
            )`,
            [],
            () => resolve(),
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Save a completed run
export const saveRun = (
  duration: number,
  distance: number,
  avgSpeed: number,
  calories: number,
  routePoints: RoutePoint[]
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO runs (date, duration, distance, avg_speed, calories) VALUES (?, ?, ?, ?, ?)',
        [date, duration, distance, avgSpeed, calories],
        (_, { insertId }) => {
          if (routePoints.length > 0) {
            const values = routePoints.map(point => 
              `(${insertId}, ${point.latitude}, ${point.longitude}, ${point.timestamp}, ${point.speed})`
            ).join(',');
            
            tx.executeSql(
              `INSERT INTO route_points (run_id, latitude, longitude, timestamp, speed) VALUES ${values}`,
              [],
              () => resolve(insertId),
              (_, error) => {
                reject(error);
                return false;
              }
            );
          } else {
            resolve(insertId);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get all runs
export const getRuns = (): Promise<Run[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM runs ORDER BY date DESC',
        [],
        (_, { rows }) => {
          const runs: Run[] = [];
          for (let i = 0; i < rows.length; i++) {
            runs.push(rows.item(i) as Run);
          }
          resolve(runs);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Get details of a specific run including route points
export const getRunDetails = (runId: number): Promise<{ run: Run, routePoints: RoutePoint[] }> => {
  return new Promise((resolve, reject) => {
    let run: Run | null = null;
    let routePoints: RoutePoint[] = [];
    
    db.transaction(tx => {
      // Get run details
      tx.executeSql(
        'SELECT * FROM runs WHERE id = ?',
        [runId],
        (_, { rows }) => {
          if (rows.length > 0) {
            run = rows.item(0) as Run;
            
            // Get route points
            tx.executeSql(
              'SELECT * FROM route_points WHERE run_id = ? ORDER BY timestamp',
              [runId],
              (_, { rows: pointRows }) => {
                for (let i = 0; i < pointRows.length; i++) {
                  routePoints.push(pointRows.item(i) as RoutePoint);
                }
                
                if (run) {
                  resolve({ run, routePoints });
                } else {
                  reject(new Error('Run not found'));
                }
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          } else {
            reject(new Error('Run not found'));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Delete a run and its associated route points
export const deleteRun = (runId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM runs WHERE id = ?',
        [runId],
        () => {
          tx.executeSql(
            'DELETE FROM route_points WHERE run_id = ?',
            [runId],
            () => resolve(),
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Type definitions
export interface Run {
  id: number;
  date: string;
  duration: number; // in seconds
  distance: number; // in kilometers
  avg_speed: number; // in km/h
  calories: number;
}

export interface RoutePoint {
  id?: number;
  run_id?: number;
  latitude: number;
  longitude: number;
  timestamp: number; // milliseconds since start
  speed: number; // in km/h
}
