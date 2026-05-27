// Funkcja generująca losowy ciąg znaków (np. X9B2)
        function generateRandomString(length) {
            const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Bez 'O' i '0' żeby się nie myliły
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        // Sprawdzamy, czy to urządzenie ma już swój kod w pamięci podręcznej (localStorage)
        let savedCode = localStorage.getItem('user_discount_code');

        if (!savedCode) {
            // Jeśli nie ma kodu, tworzymy nowy: Przedrostek KS (Kluczserw) + 5 (rabat) + 4 losowe znaki
            const newRandomPart = generateRandomString(4);
            savedCode = `KS-5-${newRandomPart}`;
            
            // Zapisujemy go w pamięci telefonu na stałe
            localStorage.setItem('user_discount_code', savedCode);
        }

        // Wyświetlamy kod na ekranie
        document.getElementById('code-display').innerText = savedCode;
