import 'package:firebase_database/firebase_database.dart';
import '../models/live_event.dart';

class FirebaseService {
  static final DatabaseReference _db = FirebaseDatabase.instance.ref();
  static final DatabaseReference _eventsRef = _db.child('events');

  static Stream<List<LiveEvent>> listenEvents() {
    return _eventsRef.onValue.map((event) {
      final list = <LiveEvent>[];
      final data = event.snapshot.value;
      if (data is Map) {
        data.forEach((key, value) {
          if (value is Map) {
            final eventData = Map<String, dynamic>.from(value);
            eventData['id'] = key.toString();
            list.add(LiveEvent.fromJson(eventData));
          }
        });
      }
      return list;
    });
  }

  static Future<void> addEvent(Map<String, dynamic> data) async {
    final ref = _eventsRef.push();
    data.remove('id');
    await ref.set(data);
  }

  static Future<void> updateEvent(String id, Map<String, dynamic> data) async {
    data.remove('id');
    await _eventsRef.child(id).update(data);
  }

  static Future<void> removeEvent(String id) async {
    await _eventsRef.child(id).remove();
  }

  static Future<void> removeAllEvents() async {
    await _eventsRef.remove();
  }

  static Future<void> saveGuestPreferences(
      String guestId, Map<String, dynamic> prefs) async {
    await _db.child('guests').child(guestId).child('preferences').set(prefs);
  }

  static Future<Map<String, dynamic>?> getGuestProfile(String guestId) async {
    final snapshot =
        await _db.child('guests').child(guestId).child('preferences').get();
    if (snapshot.value is Map) {
      return Map<String, dynamic>.from(snapshot.value as Map);
    }
    return null;
  }

  static Stream<Map<String, dynamic>?> listenGuestProfile(String guestId) {
    return _db
        .child('guests')
        .child(guestId)
        .child('preferences')
        .onValue
        .map((event) {
      if (event.snapshot.value is Map) {
        return Map<String, dynamic>.from(event.snapshot.value as Map);
      }
      return null;
    });
  }

  static Future<void> addHistoryEntry(
      String guestId, Map<String, dynamic> entry) async {
    final ref = _db.child('guests').child(guestId).child('history').push();
    await ref.set(entry);
  }
}

class FirebaseAuthService {
  static const String adminEmail = 'mdswampodsarkar@gmail.com';
  static const String adminPass = '123456';

  static bool validateAdmin(String email, String password) {
    return email == adminEmail && password == adminPass;
  }
}
