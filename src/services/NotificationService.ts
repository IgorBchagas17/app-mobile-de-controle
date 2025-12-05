import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ✅ Handler de Notificação (Essa implementação está correta e limpa)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lembretes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function initNotifications() {
  // ... (Sua lógica de permissões, que está correta)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  await setupAndroidChannel();
  return true;
}

export async function scheduleServiceReminder(
  id: number,
  dateString: string,
  description: string
) {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Define o lembrete para as 8:00 da manhã
    // Nota: mês é 0-indexado no JavaScript, por isso o 'month - 1' está correto.
    const targetDate = new Date(year, month - 1, day, 8, 0, 0);
    const now = new Date();

    const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

    // Se já passou ou é agora, retorna
    if (diffInSeconds <= 0) {
      console.log(`Serviço [ID ${id}] já passou ou é agora. Não agendado.`);
      return;
    }

    // ✅ Abordagem Limpa: Usar 'seconds' é a melhor prática para um agendamento pontual
    await Notifications.scheduleNotificationAsync({
      identifier: String(id),
      content: {
        title: "Lembrete de Serviço",
        body: `Você tem um serviço agendado: ${description}`,
        data: { serviceId: id },
        sound: true,
      },
      trigger: {
        seconds: diffInSeconds,
      },
    });

    console.log(`Lembrete agendado para o serviço [ID ${id}] em ${diffInSeconds} segundos.`);

  } catch (error) {
    console.error("Erro no agendamento do lembrete:", error);
  }
}

export async function cancelServiceReminder(id: number) {
  try {
    await Notifications.cancelScheduledNotificationAsync(String(id));
    console.log(`Lembrete para o serviço [ID ${id}] cancelado.`);
  } catch (error) {
    console.error("Erro ao cancelar o lembrete:", error);
  }
}