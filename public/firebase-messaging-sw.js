// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js');

// // Firebase 앱 구성
const firebaseConfig = {
  apiKey: 'AIzaSyDnhuKuAVg_x5HsS0Mgj8KdAWtmvJpxCLM',
  authDomain: 'geonganghaejim-640bf.firebaseapp.com',
  projectId: 'geonganghaejim-640bf',
  storageBucket: 'geonganghaejim-640bf.firebasestorage.app',
  messagingSenderId: '212838330552',
  appId: '1:212838330552:web:2d2e9b4d37ab5a00ad844d',
};

// Firebase 초기화 (서비스 워커 내에서)
firebase.initializeApp(firebaseConfig);

// 메시징 객체 생성
const messaging = firebase.messaging();

//백그라운드, 포그라운드 둘다 감지됨
// self.addEventListener('push', function (e) {
//   if (!e.data.json()) return;

//   const resultData = e.data.json().notification;
//   console.log('resultData', resultData);
//   const notificationTitle = resultData.title;
//   const notificationOptions = {
//     body: resultData.body,
//     icon: resultData.image, // 웹 푸시 이미지는 icon
//     tag: resultData.tag,
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

messaging.onBackgroundMessage((payload) => {
  //TODO: console.log('payload', payload);
  //알림 커스텀하면 기본알림, 커스텀알림 두번 울림(payload.data로 변경 완료)
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  //알림 클릭시 어느페이지로 이동할건지
  //TODO: console.log(event);

  const url = event.notification.fcmOptions.link;
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
