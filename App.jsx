import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    StyleSheet, 
    ActivityIndicator,
    Alert,
    PermissionsAndroid, 
    Platform, 
    FlatList,
    Dimensions, 
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const { width } = Dimensions.get('window');

// Inicialización de BleManager
const manager = new BleManager(); 

// ----------------------------------------------------------------------------------
// --- CONFIGURACIÓN ---
// ----------------------------------------------------------------------------------
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'; 
const WRITE_CHAR_UUID = '12345678-1234-1234-1234-123456789abe'; 
const NOTIFY_CHAR_UUID = '12345678-1234-1234-1234-123456789abd'; 

// --- Utility Functions for Native BLE Data ---
const encodeData = (str) => {
    return Buffer.from(str, 'utf8').toString('base64');
};

const decodeData = (base64) => {
    if (!base64) return '';
    try {
        return Buffer.from(base64, 'base64').toString('utf8');
    } catch (e) {
        console.error("Error al decodificar Base64:", e);
        return 'Error de decodificación: ' + base64.substring(0, 10);
    }
};

const BackIcon = () => <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{'<'}</Text>;
const SendIcon = () => <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{'➤'}</Text>;

const DeviceItem = ({ device, onConnect }) => (
    <TouchableOpacity 
        style={styles.deviceItem}
        onPress={() => onConnect(device)}
        disabled={device.connecting} 
    >
        <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.name || 'Dispositivo Desconocido'}</Text>
            <Text style={styles.deviceAddress}>{device.id}</Text>
        </View>
        <Text style={styles.deviceRSSI}>RSSI: {device.rssi || 'N/A'}</Text>
    </TouchableOpacity>
);

const BluetoothScanScreen = ({ onBack, startScan, devices, connectAndNavigate, status, error, stopScan }) => {
    const isScanning = status === 'Scanning';
    const displayStatus = {
        'Disconnected': 'Toca "Escanear" para buscar.',
        'Scanning': 'Buscando dispositivos...',
        'Connecting': `Conectando...`,
        'Connected': 'Conectado.',
        'Error': 'Error de conexión.'
    }[status] || 'Estado desconocido.';

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.headerButton}>
                    <BackIcon />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Buscar Antena Bluetooth</Text>
                <TouchableOpacity 
                    onPress={isScanning ? stopScan : startScan} 
                    style={styles.scanToggle}
                    disabled={status === 'Connecting'}
                >
                    <Text style={styles.scanToggleText}>
                        {isScanning ? 'Detener' : 'Escanear'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.scanStatusContainer}>
                {isScanning && <ActivityIndicator size="small" color="#06b6d4" style={{ marginRight: 8 }} />}
                <Text style={styles.scanStatusText}>{displayStatus}</Text>
            </View>

            <FlatList
                data={devices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DeviceItem 
                        device={item} 
                        onConnect={connectAndNavigate} 
                    />
                )}
                contentContainerStyle={styles.deviceList}
                ListEmptyComponent={() => (
                    !isScanning && devices.length === 0 && (
                        <Text style={styles.emptyListText}>No se encontraron dispositivos. Asegúrate de que tu antena esté encendida.</Text>
                    )
                )}
            />
            
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const LandingScreen = ({ onFindAntennas }) => {
    return (
        <View style={styles.landingContainer}>
            <View style={styles.antennaIconWrapper}>
                <Text style={styles.antennaIcon}>📡</Text>
            </View>
            <Text style={styles.landingTitle}>Prototipo LoRa</Text>
            <Text style={styles.landingSubtitle}>
                Sistema de comunicación en emergencias, conéctate a una antena cercana mediante Bluetooth
            </Text>
            <TouchableOpacity
                onPress={onFindAntennas}
                style={styles.landingButton}
            >
                <Text style={styles.landingButtonText}>Buscar antenas cercanas</Text>
            </TouchableOpacity>
        </View>
    );
};

const ChatScreen = ({ connectedDevice, messages, onSendMessage, onDisconnect }) => {
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = (isSOS = false) => {
        const textToSend = isSOS ? "Emergencia! SOS! Emergencia!" : inputText.trim();
        if (textToSend === '') return;
        onSendMessage(textToSend, isSOS);
        if (!isSOS) setInputText('');
    };

    const MessageBubble = ({ msg }) => {
        const isMe = msg.sender === 'me';
        const isSystem = msg.sender === 'system';
        
        if (isSystem) {
            return (
                <View style={styles.systemMessageContainer}>
                    <Text style={styles.systemMessageText}>{msg.text}</Text>
                </View>
            );
        }

        const bubbleStyle = isMe ? styles.myBubble : styles.otherBubble;
        const alignStyle = isMe ? styles.alignRight : styles.alignLeft;
        const sosStyle = msg.isSOS ? styles.sosBubble : {};

        return (
            <View style={alignStyle}>
                <View style={[styles.bubbleBase, bubbleStyle, sosStyle]}>
                    <Text style={styles.bubbleText}>{msg.text}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.fullScreenContainer}>
            <View style={styles.chatHeader}>
                <TouchableOpacity onPress={onDisconnect} style={styles.headerButton}>
                    <BackIcon />
                </TouchableOpacity>
                <View style={styles.chatHeaderInfo}>
                    <Text style={styles.chatHeaderTitle}>{connectedDevice?.name || 'Antena LoRa'}</Text>
                    <Text style={styles.chatHeaderStatus}>Conectado</Text>
                </View>
            </View>

            <ScrollView 
                ref={scrollViewRef} 
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
            >
                {messages.map((msg, index) => <MessageBubble key={index} msg={msg} />)}
            </ScrollView>

            <View style={styles.inputFooter}>
                <TouchableOpacity onPress={() => handleSend(true)} style={styles.sosButton}>
                    <Text style={styles.sosButtonText}>SOS</Text>
                </TouchableOpacity>
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Escribe tu mensaje"
                    placeholderTextColor="#9ca3af"
                    style={styles.chatInput}
                    onSubmitEditing={() => handleSend(false)} 
                    returnKeyType="send"
                    blurOnSubmit={false}
                />
                <TouchableOpacity
                    onPress={() => handleSend(false)}
                    style={[
                        styles.sendButton,
                        !inputText.trim() && styles.sendButtonDisabled
                    ]}
                    disabled={!inputText.trim()}
                >
                    <SendIcon />
                </TouchableOpacity>
            </View>
        </View>
    );
};


// ----------------------------------------------------------------------------------
// --- MAIN APP COMPONENT (BLE LOGIC CONTAINER) ---
// ----------------------------------------------------------------------------------

export default function App() {
    // Navigation State
    const [screen, setScreen] = useState('landing'); 
    
    // BLE State & Refs
    const [status, setStatus] = useState('Disconnected'); 
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    
    // ESTADOS PARA EL LISTADO DE DISPOSITIVOS
    const [discoveredDevices, setDiscoveredDevices] = useState([]); 
    const devicesMapRef = useRef(new Map()); // Para manejar dispositivos únicos

    const [connectedDevice, setConnectedDevice] = useState(null);
    const notifySubscriptionRef = useRef(null); 
    const isScanningRef = useRef(false); 
    // 💡 NUEVO REF: Para almacenar y limpiar el timeout del escaneo
    const scanTimeoutRef = useRef(null); 

    // Almacena el ID y texto del último mensaje enviado para filtrar el eco.
    const lastSentMessageRef = useRef(null); 
    // Set para almacenar temporalmente los IDs de los mensajes de eco ya procesados
    const processedEchoesRef = useRef(new Set()); 


    // --- Utility Functions ---

    const logMessage = useCallback((sender, text, isSOS = false) => {
        const newMessage = {
            id: Date.now(),
            sender,
            text,
            isSOS,
        };
        // Siempre usamos el callback de setMessages para evitar race conditions
        setMessages(prev => [...prev, newMessage]);
        console.log(`[${sender.toUpperCase()}] ${text}`);
    }, []);

    const requestPermissions = useCallback(async () => {
        if (Platform.OS === 'android') {
            const apiLevel = Platform.Version;

            if (apiLevel < 31) { 
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Permiso de Localización (Bluetooth)',
                        message: 'La aplicación necesita acceso a la localización para escanear dispositivos Bluetooth Low Energy.',
                        buttonNeutral: 'Pregúntame más tarde',
                        buttonNegative: 'Cancelar',
                        buttonPositive: 'OK',
                    }
                );
                const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                if (!isGranted) {
                    setError('Permisos de Localización denegados. No se puede escanear.');
                    logMessage('system', 'Permisos de Localización denegados.');
                }
                return isGranted;
            } else { 
                const grantedScan = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
                const grantedConnect = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
                const grantedLocation = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);


                const allGranted = (
                    grantedScan === PermissionsAndroid.RESULTS.GRANTED &&
                    grantedConnect === PermissionsAndroid.RESULTS.GRANTED &&
                    grantedLocation === PermissionsAndroid.RESULTS.GRANTED
                );

                if (!allGranted) {
                    setError('Permisos de Bluetooth denegados. No se puede escanear.');
                    logMessage('system', 'Permisos de BLE denegados.');
                }
                return allGranted;
            }
        }
        return true; 
    }, [logMessage]);
    
    const cleanupAndDisconnect = useCallback(async (deviceId, deviceName = 'Dispositivo') => {
        logMessage('system', `Intentando desconectar de ${deviceName}...`);

        if (notifySubscriptionRef.current) {
            notifySubscriptionRef.current.remove();
            notifySubscriptionRef.current = null;
        }

        if (deviceId) {
            await manager.cancelDeviceConnection(deviceId).catch(e => {
                console.log("Error during disconnect (may be already disconnected):", e.message);
            });
        }
        
        setConnectedDevice(null);
        setStatus('Disconnected');
        if (screen === 'chat') { 
            setScreen('scan');
        }
        logMessage('system', `Desconectado.`);
    }, [logMessage, screen]); 

    useEffect(() => {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                logMessage('system', 'Bluetooth Encendido. Listo para escanear.');
            } else {
                logMessage('system', `Bluetooth State: ${state}. Por favor, activa el Bluetooth.`);
                if (state === 'Unauthorized' || state === 'PoweredOff') {
                     Alert.alert("Bluetooth Requerido", "Por favor, activa el Bluetooth para usar esta aplicación, o acepta los permisos.");
                }
                setStatus('Disconnected');
                if (connectedDevice) {
                    cleanupAndDisconnect(connectedDevice.id);
                }
            }
        }, true); 

        return () => subscription.remove();
    }, [logMessage, connectedDevice, cleanupAndDisconnect]);

    const connectToDevice = useCallback(async (device) => {
        setStatus('Connecting');
        logMessage('system', `Intentando conectar a ${device.name}...`);
        
        try {
            // 1. 💡 FIX: Detener el escaneo y limpiar el timeout inmediatamente
            manager.stopDeviceScan();
            if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
            }
            logMessage('system', 'Escaneo detenido por usuario para iniciar conexión.');
            // (El mensaje de "Escaneo detenido por usuario" ahora aparece aquí, lo cual es correcto)


            const connected = await manager.connectToDevice(device.id, { 
                autoConnect: false,
                requestMTU: 256 
            });
            
            const fullDevice = await connected.discoverAllServicesAndCharacteristics();
            logMessage('system', `Conexión establecida. MTU negociado a 256. Descubriendo servicios...`);


            fullDevice.onDisconnected(() => {
                logMessage('system', `Dispositivo ${fullDevice.name} desconectado inesperadamente.`);
                Alert.alert("Desconexión", `${fullDevice.name} ha sido desconectado.`);
                cleanupAndDisconnect(fullDevice.id, fullDevice.name);
            });

            // 4. CONFIGURAR NOTIFICACIONES (RECEPCIÓN DE DATOS)
            const subscription = manager.monitorCharacteristicForDevice(
                fullDevice.id,
                SERVICE_UUID,
                NOTIFY_CHAR_UUID,
                (error, characteristic) => {
                    if (error) {
                        logMessage('system', `Error en la notificación: ${error.message}`);
                        return;
                    }
                    if (characteristic?.value) {
                        const receivedStringRaw = decodeData(characteristic.value);
                        const receivedString = receivedStringRaw.trim(); 
                        const isSOS = receivedString.includes("Emergencia! SOS!");

                        const lastSent = lastSentMessageRef.current;
                        
                        // FILTRADO DE ECO: Comprobamos si el mensaje recibido coincide con el último enviado.
                        const isSelfEcho = lastSent && lastSent.text.trim() === receivedString;

                        if (isSelfEcho) {
                            if (!processedEchoesRef.current.has(lastSent.id)) {
                                console.log("Eco local reconocido y aceptado:", lastSent.text);
                                processedEchoesRef.current.add(lastSent.id); 
                            } else {
                                console.log("Eco duplicado bloqueado:", lastSent.text);
                            }
                            
                            setTimeout(() => {
                                lastSentMessageRef.current = null;
                                processedEchoesRef.current.delete(lastSent.id);
                            }, 500); 

                        } else {
                            // MENSAJE EXTERNO: Si no es un eco de lo último que enviamos, lo registramos como 'other'
                            logMessage('other', receivedString, isSOS);
                        }
                    }
                },
                'notifyHandle' 
            );

            notifySubscriptionRef.current = subscription;
            setConnectedDevice(fullDevice);
            setStatus('Connected');
            logMessage('system', `Notificaciones de recepción activadas. ¡Listo!`);
            setScreen('chat');

        } catch (e) {
            setError(`Fallo de conexión: ${e.message}`);
            logMessage('system', `Error de conexión nativa: ${e.message}`);
            cleanupAndDisconnect(device.id); 
        }
    }, [logMessage, cleanupAndDisconnect]);


    const scanDevices = async () => {
        const isPermitted = await requestPermissions();
        if (!isPermitted) {
            return; 
        }
        
        if (isScanningRef.current) return;

        const state = await manager.state();
        if (state !== 'PoweredOn') {
            logMessage('system', 'Bluetooth no está activo. Por favor, actívalo.');
            Alert.alert("Bluetooth Requerido", "Por favor, activa el Bluetooth para escanear.");
            return;
        }

        setDiscoveredDevices([]);
        devicesMapRef.current.clear();

        setStatus('Scanning');
        setError(null);
        isScanningRef.current = true;
        logMessage('system', 'Iniciando escaneo de dispositivos...');

        // 💡 ALMACENAR: Guardamos el ID del timeout
        const id = setTimeout(() => {
            if (isScanningRef.current) { 
                stopScan(true); // Pasamos 'true' para indicar que fue por timeout
                setError('Escaneo terminado. Toca "Escanear" para reintentar.');
            }
        }, 15000); 
        scanTimeoutRef.current = id;


        manager.startDeviceScan(
            null,
            null,
            (error, device) => {
                if (error) {
                    // Limpiar el timeout si el error ocurre durante el escaneo
                    if (scanTimeoutRef.current) {
                        clearTimeout(scanTimeoutRef.current);
                        scanTimeoutRef.current = null;
                    }
                    logMessage('system', `Error durante el escaneo: ${error.message}`);
                    setError(`Error durante el escaneo: ${error.message}`);
                    stopScan();
                    return;
                }
                
                if (
                    device && 
                    !devicesMapRef.current.has(device.id)
                ) {
                    devicesMapRef.current.set(device.id, device);
                    setDiscoveredDevices(Array.from(devicesMapRef.current.values()));
                    logMessage('system', `Antena LoRa encontrada: ${device.name || device.id}`);
                }
            }
        );
    };

    // 💡 MODIFICACIÓN: La función stopScan ahora acepta un argumento
    const stopScan = useCallback((isTimeout = false) => {
        manager.stopDeviceScan();
        isScanningRef.current = false;
        setStatus('Disconnected');

        // Limpiamos el timeout aquí
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }

        if (isTimeout) {
            logMessage('system', 'Escaneo detenido por timeout.');
        } else {
            // Este log solo aparece si el usuario detiene manualmente (y no conecta)
            // Cuando se conecta, el log viene de connectToDevice.
            logMessage('system', 'Escaneo detenido por usuario.'); 
        }

    }, [logMessage]);


    // 5. SEND DATA (WRITE) LOGIC 
    const sendData = async (textToSend, isSOS = false) => {
        if (status !== 'Connected' || !connectedDevice) {
            Alert.alert("Error de Conexión", "No hay conexión activa para enviar datos.");
            logMessage('system', 'Error: No hay conexión activa para enviar datos.');
            return;
        }

        const tempMessage = {
            id: Date.now(),
            text: textToSend.trim(), 
            isSOS: isSOS,
            sender: 'me', 
        };

        // 1. Registrar inmediatamente el mensaje en la pantalla del remitente (burbuja azul, derecha)
        logMessage(tempMessage.sender, tempMessage.text, tempMessage.isSOS);

        // 2. Almacenar el mensaje para filtrar el eco entrante
        lastSentMessageRef.current = tempMessage;
        processedEchoesRef.current.clear(); 

        try {
            const encodedData = encodeData(tempMessage.text);
            
            await manager.writeCharacteristicWithResponseForDevice(
                connectedDevice.id,
                SERVICE_UUID,
                WRITE_CHAR_UUID,
                encodedData
            );
            
            logMessage('system', `Datos enviados: "${tempMessage.text}" (con confirmación).`);

        } catch (e) {
            // Si hay un error de escritura, es la causa del problema
            Alert.alert("Error de Envío", `Fallo al enviar datos: ${e.message}`);
            setError(`Error al escribir: ${e.message}`);
            logMessage('system', `Error al escribir nativo: ${e.message}`);
            
            if (e.message.includes('disconnected')) {
                cleanupAndDisconnect(connectedDevice.id, connectedDevice.name);
            }
            // Si falla, limpiar el buffer para no esperar un eco
            lastSentMessageRef.current = null;
        }
    };

    // --- UI Rendering ---

    const renderScreen = () => {
        switch (screen) {
            case 'landing':
                return <LandingScreen onFindAntennas={() => setScreen('scan')} />;
            case 'scan':
                return (
                    <BluetoothScanScreen 
                        onBack={() => setScreen('landing')} 
                        startScan={scanDevices} 
                        stopScan={stopScan} 
                        devices={discoveredDevices} 
                        connectAndNavigate={connectToDevice}
                        status={status}
                        error={error}
                    />
                );
            case 'chat':
                return (
                    <ChatScreen 
                        connectedDevice={connectedDevice} 
                        messages={messages} 
                        onSendMessage={sendData} 
                        onDisconnect={() => cleanupAndDisconnect(connectedDevice.id, connectedDevice.name)}
                    />
                );
            default:
                return <LandingScreen onFindAntennas={() => setScreen('scan')} />;
        }
    };

    return (
        <View style={styles.appContainer}>
            {renderScreen()}
        </View>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
        backgroundColor: '#111827', 
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#1f2937', 
    },
    landingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#1f2937',
    },
    antennaIconWrapper: {
        width: 96,
        height: 96,
        marginBottom: 24,
        borderRadius: 48,
        backgroundColor: '#06b6d4', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    antennaIcon: {
        fontSize: 40,
        color: 'white',
    },
    landingTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    landingSubtitle: {
        fontSize: 18,
        color: '#9ca3af', 
        marginBottom: 40,
        textAlign: 'center',
        maxWidth: 350,
    },
    landingButton: {
        width: '100%',
        maxWidth: 350,
        backgroundColor: '#06b6d4', 
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 50,
        elevation: 10, 
        shadowColor: '#06b6d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    landingButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151', 
        backgroundColor: '#1f2937',
    },
    headerButton: {
        padding: 8,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textAlign: 'center',
    },
    scanToggle: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#34d399',
    },
    scanToggleText: {
        color: 'white',
        fontWeight: 'bold',
    },
    scanStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#2b3644',
    },
    scanStatusText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    deviceList: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    deviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#374151',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#06b6d4',
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    deviceAddress: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    deviceRSSI: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34d399',
    },
    emptyListText: {
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 50,
    },
    errorText: {
        color: '#f87171', 
        marginTop: 16,
        paddingHorizontal: 16,
        textAlign: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
        backgroundColor: '#1f2937',
    },
    chatHeaderInfo: {
        marginLeft: 12,
    },
    chatHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    chatHeaderStatus: {
        fontSize: 12,
        color: '#34d399', 
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 10,
    },
    bubbleBase: {
        maxWidth: width * 0.8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    alignRight: {
        alignSelf: 'flex-end',
    },
    alignLeft: {
        alignSelf: 'flex-start',
    },
    myBubble: {
        backgroundColor: '#06b6d4', 
    },
    otherBubble: {
        backgroundColor: '#374151', 
    },
    sosBubble: {
        backgroundColor: '#dc2626', 
        fontWeight: 'bold',
    },
    bubbleText: {
        color: 'white',
        fontSize: 15,
    },
    systemMessageContainer: {
        alignSelf: 'center',
        marginVertical: 8,
        paddingHorizontal: 16,
        width: '100%',
    },
    systemMessageText: {
        fontSize: 12,
        color: '#9ca3af', 
        textAlign: 'center',
    },
    inputFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#374151',
        backgroundColor: '#111827', 
    },
    sosButton: {
        backgroundColor: '#dc2626', 
        padding: 12,
        borderRadius: 50,
        marginRight: 8,
        elevation: 5,
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    sosButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#374151', 
        borderRadius: 25,
        minHeight: 45,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        paddingHorizontal: 16,
        color: 'white',
        marginRight: 8,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#06b6d4', 
        padding: 12,
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#06b6d4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    sendButtonDisabled: {
        backgroundColor: '#4b5563', 
    },
});