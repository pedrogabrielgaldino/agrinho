// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Coordenadas da sua plantação de tomate (Porto Alegre, RS)
    const latitude = -30.034604;
    const longitude = -51.2185614;

    // AVISO: Substitua 'SUA_API_KEY_AQUI' pela sua chave de API do OpenWeatherMap.
    // Você pode obter uma chave de API gratuita em https://openweathermap.org/
    const apiKey = ""; // Deixe como está, o Canvas irá fornecer automaticamente.

    const weatherCardsContainer = document.getElementById('weather-cards-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    /**
     * Mapeia os códigos de ícones do OpenWeatherMap para emojis correspondentes
     * para uma exibição visual simples.
     * @param {string} iconCode - O código do ícone da API OpenWeatherMap.
     * @returns {string} O emoji correspondente.
     */
    function getWeatherEmoji(iconCode) {
        switch (iconCode) {
            case '01d': return '☀️'; // Clear sky (day)
            case '01n': return '🌙'; // Clear sky (night)
            case '02d': return '🌤️'; // Few clouds (day)
            case '02n': return '☁️'; // Few clouds (night)
            case '03d':
            case '03n': return '☁️'; // Scattered clouds
            case '04d':
            case '04n': return '☁️☁️'; // Broken clouds
            case '09d':
            case '09n': return '🌧️'; // Shower rain
            case '10d': return '🌦️'; // Rain (day)
            case '10n': return '🌧️'; // Rain (night)
            case '11d':
            case '11n': return '⛈️'; // Thunderstorm
            case '13d':
            case '13n': return '❄️'; // Snow
            case '50d':
            case '50n': return '🌫️'; // Mist
            default: return '❓'; // Unknown
        }
    }

    /**
     * Busca a previsão do tempo para os próximos 7 dias usando a API One Call do OpenWeatherMap.
     * @returns {Promise<Object>} Os dados da previsão do tempo.
     */
    async function fetchWeatherForecast() {
        // URL da API One Call do OpenWeatherMap para previsão de 7 dias
        // 'exclude=current,minutely,hourly,alerts' para obter apenas dados diários
        // 'units=metric' para temperaturas em Celsius
        // 'lang=pt_br' para descrições em português
        const apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&units=metric&lang=pt_br&appid=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                // Lança um erro se a resposta da rede não for OK (status 4xx ou 5xx)
                const errorData = await response.json();
                throw new Error(`Erro HTTP: ${response.status} - ${errorData.message || response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar a previsão do tempo:', error);
            errorMessage.textContent = `Não foi possível carregar a previsão do tempo: ${error.message}. Verifique sua chave de API e conexão.`;
            errorMessage.classList.remove('hidden');
            return null; // Retorna null em caso de erro
        } finally {
            loadingIndicator.classList.add('hidden'); // Esconde o indicador de carregamento após a tentativa
        }
    }

    /**
     * Cria e adiciona um cartão de previsão do tempo ao contêiner.
     * @param {Object} dailyData - Objeto contendo os dados diários da previsão.
     */
    function createWeatherCard(dailyData) {
        const date = new Date(dailyData.dt * 1000); // Converte timestamp para objeto Date
        const dayOptions = { weekday: 'long' }; // Opções para formatar o dia da semana
        const dateOptions = { day: 'numeric', month: 'short' }; // Opções para formatar a data

        const dayOfWeek = date.toLocaleDateString('pt-BR', dayOptions); // Ex: "domingo"
        const formattedDate = date.toLocaleDateString('pt-BR', dateOptions); // Ex: "18 de jun."

        const tempMax = Math.round(dailyData.temp.max);
        const tempMin = Math.round(dailyData.temp.min);
        const description = dailyData.weather[0].description;
        const iconCode = dailyData.weather[0].icon;
        const humidity = dailyData.humidity;
        const windSpeed = (dailyData.wind_speed * 3.6).toFixed(1); // Convert m/s to km/h

        const weatherEmoji = getWeatherEmoji(iconCode);

        // Cria o elemento do cartão
        const card = document.createElement('div');
        card.classList.add('weather-card');

        card.innerHTML = `
            <div class="text-xl font-semibold mb-2">${dayOfWeek}</div>
            <div class="text-sm opacity-80 mb-4">${formattedDate}</div>
            <div class="weather-icon">${weatherEmoji}</div>
            <div class="temperature">${tempMax}° / ${tempMin}°C</div>
            <div class="description">${description}</div>
            <div class="additional-info">
                Umidade: ${humidity}%<br>
                Vento: ${windSpeed} km/h
            </div>
        `;

        weatherCardsContainer.appendChild(card);
    }

    /**
     * Inicializa a aplicação, buscando e exibindo a previsão do tempo.
     */
    async function init() {
        const weatherData = await fetchWeatherForecast();
        if (weatherData && weatherData.daily) {
            // Pega os próximos 7 dias (o índice 0 é hoje, então pegamos 7 a partir dele)
            const nextSevenDays = weatherData.daily.slice(0, 7);
            nextSevenDays.forEach(day => createWeatherCard(day));
        } else {
            // Se não houver dados diários, mostra mensagem de erro
            errorMessage.textContent = 'Dados da previsão do tempo indisponíveis.';
            errorMessage.classList.remove('hidden');
        }
    }

    // Inicia a aplicação quando o DOM estiver completamente carregado
    init();
});
