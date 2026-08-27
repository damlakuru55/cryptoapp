import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("home");
  const [profilePage, setProfilePage] = useState("profile");
  const [showAllCoins, setShowAllCoins] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );

  const marketRef = useRef(null);

  const popularCoins = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      pair: "BTCUSDT",
      price: 0,
      change: 0,
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      pair: "ETHUSDT",
      price: 0,
      change: 0,
    },
    {
      name: "Solana",
      symbol: "SOL",
      pair: "SOLUSDT",
      price: 0,
      change: 0,
    },
    {
      name: "BNB",
      symbol: "BNB",
      pair: "BNBUSDT",
      price: 0,
      change: 0,
    },
  ];

  const [coins, setCoins] = useState(popularCoins);
  const [allCoins, setAllCoins] = useState([]);

  /* TEMA */

  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        theme
      );
    }
  }, [theme]);

  /* FAVORİLER */

  useEffect(() => {
    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  /* CANLI FİYATLAR */

  useEffect(() => {
    let active = true;

    const getPrices = async () => {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr"
        );

        if (!response.ok) {
          throw new Error("Piyasa verisi alınamadı");
        }

        const data = await response.json();

        if (!active) return;

        setCoins((oldCoins) =>
          oldCoins.map((coin) => {
            const liveCoin = data.find(
              (item) => item.symbol === coin.pair
            );

            if (!liveCoin) return coin;

            return {
              ...coin,
              price: Number(liveCoin.lastPrice),
              change: Number(
                liveCoin.priceChangePercent
              ),
            };
          })
        );

        if (showAllCoins) {
          const usdtCoins = data
            .filter(
              (item) =>
                item.symbol.endsWith("USDT") &&
                Number(item.lastPrice) > 0
            )
            .map((item) => ({
              name: item.symbol.replace("USDT", ""),
              symbol: item.symbol.replace("USDT", ""),
              pair: item.symbol,
              price: Number(item.lastPrice),
              change: Number(
                item.priceChangePercent
              ),
            }));

          setAllCoins(usdtCoins);
        }
      } catch (error) {
        console.log(
          "Piyasa verisi alınamadı:",
          error
        );
      }
    };

    getPrices();

    const interval = setInterval(
      getPrices,
      2000
    );

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [showAllCoins]);

  /* TÜM KRİPTOLAR */

  const loadAllCoins = async () => {
    try {
      setShowAllCoins(true);

      const response = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr"
      );

      if (!response.ok) {
        throw new Error(
          "Kripto listesi alınamadı"
        );
      }

      const data = await response.json();

      const list = data
        .filter(
          (item) =>
            item.symbol.endsWith("USDT") &&
            Number(item.lastPrice) > 0
        )
        .map((item) => ({
          name: item.symbol.replace("USDT", ""),
          symbol: item.symbol.replace("USDT", ""),
          pair: item.symbol,
          price: Number(item.lastPrice),
          change: Number(
            item.priceChangePercent
          ),
        }));

      setAllCoins(list);

      setTimeout(() => {
        marketRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.log(
        "Kripto listesi alınamadı:",
        error
      );
    }
  };

  /* PROFİL */

  const openProfilePage = (section) => {
    setPage("profile");
    setProfilePage(section);
  };

  /* FAVORİ */

  const toggleFavorite = (symbol) => {
    setFavorites((oldFavorites) => {
      if (oldFavorites.includes(symbol)) {
        return oldFavorites.filter(
          (item) => item !== symbol
        );
      }

      return [...oldFavorites, symbol];
    });
  };

  /* FİYAT */

  const formatPrice = (price) => {
    if (!price) return "...";

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits:
        price < 1 ? 4 : 2,
      maximumFractionDigits:
        price < 1 ? 6 : 2,
    }).format(price);
  };

  const currentCoins = showAllCoins
    ? allCoins
    : coins;

  const filteredCoins = currentCoins.filter(
    (coin) =>
      coin.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      coin.symbol
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div className="logo">

          <span className="logo-icon">
            ₿
          </span>

          <span>
            Nex<span>Coin</span>
          </span>

        </div>

        <nav>

          <a
            className={
              page === "home"
                ? "active"
                : ""
            }
            onClick={() => {
              setPage("home");
              setShowAllCoins(false);
            }}
          >
            Ana Sayfa
          </a>

          <a
            onClick={loadAllCoins}
          >
            Kripto Paralar
          </a>

          <a
            onClick={() =>
              openProfilePage(
                "favorites"
              )
            }
          >
            Favoriler
          </a>

        </nav>

        <button
          className="profile-button"
          onClick={() =>
            openProfilePage("profile")
          }
        >
          Profil
        </button>

      </header>

      {/* ANA SAYFA */}

      {page === "home" && (
        <>

          <main>

            <section className="hero">

              <div>

                <p className="eyebrow">
                  KRİPTO PİYASASI
                </p>

                <h1>
                  Kripto dünyasını
                  <br />
                  tek yerden takip et.
                </h1>

                <p className="hero-text">
                  Kripto paraların fiyatlarını,
                  değişimlerini ve piyasa
                  hareketlerini kolayca takip et.
                </p>

                <button
                  className="primary-button"
                  onClick={loadAllCoins}
                >
                  Piyasayı Keşfet →
                </button>

              </div>

              <div className="hero-card">

                <div className="chart-header">

                  <span>
                    Bitcoin
                  </span>

                  <strong>
                    $
                    {formatPrice(
                      coins[0]?.price
                    )}
                  </strong>

                </div>

                <div className="fake-chart">

                  <div className="line line-1"></div>
                  <div className="line line-2"></div>
                  <div className="line line-3"></div>

                </div>

                <div className="chart-bottom">

                  <span>
                    BTC
                  </span>

                  <span
                    className={
                      coins[0]?.change >= 0
                        ? "green"
                        : "red"
                    }
                  >
                    {coins[0]?.change >= 0
                      ? "+"
                      : ""}
                    {coins[0]?.change.toFixed(2)}
                    %
                  </span>

                </div>

              </div>

            </section>

            {/* PİYASA */}

            <section
              className="market"
              ref={marketRef}
            >

              <div className="section-heading">

                <div>

                  <p className="eyebrow">
                    {showAllCoins
                      ? "TÜM PİYASA"
                      : "PİYASA"}
                  </p>

                  <h2>
                    {showAllCoins
                      ? "Tüm Kripto Paralar"
                      : "Popüler Kripto Paralar"}
                  </h2>

                </div>

                <input
                  type="text"
                  placeholder="Kripto ara..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="coin-grid">

                {filteredCoins.map(
                  (coin) => (

                    <div
                      className="coin-card"
                      key={coin.pair}
                    >

                      <div className="coin-top">

                        <div className="coin-icon">
                          {coin.symbol.charAt(0)}
                        </div>

                        <div>

                          <h3>
                            {coin.name}
                          </h3>

                          <span>
                            {coin.symbol}
                          </span>

                        </div>

                        <button
                          className="star"
                          onClick={() =>
                            toggleFavorite(
                              coin.symbol
                            )
                          }
                        >
                          {favorites.includes(
                            coin.symbol
                          )
                            ? "★"
                            : "☆"}
                        </button>

                      </div>

                      <div className="coin-price">
                        $
                        {formatPrice(
                          coin.price
                        )}
                      </div>

                      <div className="coin-change">

                        <span
                          className={
                            coin.change >= 0
                              ? "green"
                              : "red"
                          }
                        >
                          {coin.change >= 0
                            ? "+"
                            : ""}
                          {coin.change.toFixed(2)}
                          %
                        </span>

                        <span>
                          24 saat
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

              {/* SONUÇ BULUNAMADI */}

              {filteredCoins.length === 0 && (

                <div
                  style={{
                    background: "#111219",
                    color: "#ffffff",
                    border:
                      "1px solid #272833",
                    borderRadius: "16px",
                    padding: "40px",
                    marginTop: "20px",
                    textAlign: "center",
                  }}
                >

                  <div
                    style={{
                      fontSize: "42px",
                      marginBottom: "12px",
                    }}
                  >
                    🔍
                  </div>

                  <h2
                    style={{
                      color: "#ffffff",
                      margin: 0,
                    }}
                  >
                    Sonuç bulunamadı
                  </h2>

                  <p
                    style={{
                      color: "#777985",
                      marginTop: "10px",
                    }}
                  >
                    Aradığın kripto para
                    bulunamadı.
                  </p>

                </div>

              )}

            </section>

          </main>

          <footer>

            <span>
              © 2026 NexCoin
            </span>

            <span>
              Kripto piyasalarını keşfet 🚀
            </span>

          </footer>

        </>
      )}

      {/* PROFİL SİSTEMİ */}

      {page === "profile" && (

        <main
          style={{
            width: "86%",
            maxWidth: "900px",
            margin: "0 auto",
            padding: "50px 0 80px",
          }}
        >

          {/* GERİ */}

          <button
            onClick={() => {

              if (
                profilePage === "profile"
              ) {
                setPage("home");
              } else {
                setProfilePage("profile");
              }

            }}
            style={{
              background: "#12131a",
              border:
                "1px solid #30313b",
              color: "white",
              padding: "11px 18px",
              borderRadius: "10px",
              cursor: "pointer",
              marginBottom: "25px",
            }}
          >
            ←{" "}
            {profilePage === "profile"
              ? "Ana Sayfa"
              : "Profil"}
          </button>

          {/* PROFİL */}

          {profilePage === "profile" && (

            <section
              style={{
                background: "#111219",
                border:
                  "1px solid #272833",
                borderRadius: "24px",
                padding: "45px",
                boxShadow:
                  "0 25px 80px rgba(0,0,0,0.35)",
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "25px",
                  marginBottom: "45px",
                }}
              >

                <div
                  style={{
                    width: "95px",
                    height: "95px",
                    minWidth: "95px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg,#8c78ff,#5541c9)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "40px",
                  }}
                >
                  👤
                </div>

                <div>

                  <p
                    style={{
                      color: "#8c78ff",
                      fontSize: "12px",
                      fontWeight: "800",
                      letterSpacing: "2px",
                      margin:
                        "0 0 8px",
                    }}
                  >
                    PROFİL
                  </p>

                  <h1
                    style={{
                      color: "white",
                      fontSize: "30px",
                      margin:
                        "0 0 8px",
                    }}
                  >
                    NexCoin Kullanıcısı
                  </h1>

                  <p
                    style={{
                      color: "#777985",
                      margin: 0,
                    }}
                  >
                    Kripto piyasasını
                    takip ediyorsun.
                  </p>

                </div>

              </div>

              {/* İSTATİSTİKLER */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "15px",
                  marginBottom: "30px",
                }}
              >

                <div
                  style={{
                    background: "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "15px",
                    padding: "22px",
                  }}
                >

                  <div>⭐</div>

                  <strong
                    style={{
                      display: "block",
                      color: "white",
                      fontSize: "25px",
                      marginTop: "10px",
                    }}
                  >
                    {favorites.length}
                  </strong>

                  <span
                    style={{
                      color: "#777985",
                      fontSize: "12px",
                    }}
                  >
                    Favoriler
                  </span>

                </div>

                <div
                  style={{
                    background: "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "15px",
                    padding: "22px",
                  }}
                >

                  <div>📊</div>

                  <strong
                    style={{
                      display: "block",
                      color: "white",
                      fontSize: "25px",
                      marginTop: "10px",
                    }}
                  >
                    0
                  </strong>

                  <span
                    style={{
                      color: "#777985",
                      fontSize: "12px",
                    }}
                  >
                    Takip Edilen
                  </span>

                </div>

                <div
                  style={{
                    background: "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "15px",
                    padding: "22px",
                  }}
                >

                  <div>🚀</div>

                  <strong
                    style={{
                      display: "block",
                      color: "white",
                      fontSize: "25px",
                      marginTop: "10px",
                    }}
                  >
                    2026
                  </strong>

                  <span
                    style={{
                      color: "#777985",
                      fontSize: "12px",
                    }}
                  >
                    Katılım Yılı
                  </span>

                </div>

              </div>

              {/* PROFİL MENÜLERİ */}

              <div>

                <div
                  onClick={() =>
                    setProfilePage(
                      "favorites"
                    )
                  }
                  style={{
                    padding: "20px",
                    background: "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "14px",
                    marginBottom: "12px",
                    cursor: "pointer",
                  }}
                >

                  <strong
                    style={{
                      color: "white",
                    }}
                  >
                    ⭐ Favorilerim
                  </strong>

                  <p
                    style={{
                      color: "#777985",
                      fontSize: "12px",
                      margin:
                        "6px 0 0",
                    }}
                  >
                    Favori kripto
                    paralarını
                    görüntüle
                  </p>

                </div>

                <div
                  onClick={() =>
                    setProfilePage(
                      "following"
                    )
                  }
                  style={{
                    padding: "20px",
                    background: "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "14px",
                    marginBottom: "12px",
                    cursor: "pointer",
                  }}
                >

                  <strong
                    style={{
                      color: "white",
                    }}
                  >
                    📊 Takip Listem
                  </strong>

                  <p
                    style={{
                      color: "#777985",
                      fontSize: "12px",
                      margin:
                        "6px 0 0",
                    }}
                  >
                    Takip ettiğin
                    kripto paraları
                    görüntüle
                  </p>

                </div>

                <div
                  onClick={() =>
                    setProfilePage(
                      "settings"
                    )
                  }
                  style={{
                    padding: "20px",
                    background: "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "14px",
                    cursor: "pointer",
                  }}
                >

                  <strong
                    style={{
                      color: "white",
                    }}
                  >
                    ⚙️ Ayarlar
                  </strong>

                  <p
                    style={{
                      color: "#777985",
                      fontSize: "12px",
                      margin:
                        "6px 0 0",
                    }}
                  >
                    Uygulama
                    ayarlarını yönet
                  </p>

                </div>

              </div>

            </section>

          )}

          {/* FAVORİLER */}

          {profilePage === "favorites" && (

            <section
              style={{
                background: "#111219",
                border:
                  "1px solid #272833",
                borderRadius: "24px",
                padding: "40px",
              }}
            >

              <p className="eyebrow">
                FAVORİLER
              </p>

              <h1
                style={{
                  color: "white",
                }}
              >
                Favorilerim ⭐
              </h1>

              {favorites.length === 0 ? (

                <div
                  style={{
                    padding: "35px",
                    marginTop: "25px",
                    textAlign: "center",
                    background:
                      "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "15px",
                  }}
                >

                  <div
                    style={{
                      fontSize: "45px",
                      marginBottom: "15px",
                    }}
                  >
                    ⭐
                  </div>

                  <h2
                    style={{
                      color: "white",
                    }}
                  >
                    Henüz favorin yok
                  </h2>

                  <p
                    style={{
                      color: "#777985",
                    }}
                  >
                    Kripto paraların
                    yanındaki yıldız
                    simgesine basarak
                    favorilerine
                    ekleyebilirsin.
                  </p>

                </div>

              ) : (

                favorites.map(
                  (symbol) => {

                    const coin =
                      [
                        ...coins,
                        ...allCoins,
                      ].find(
                        (item) =>
                          item.symbol ===
                          symbol
                      );

                    if (!coin)
                      return null;

                    return (
                      <div
                        key={symbol}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          padding: "18px",
                          background:
                            "#181922",
                          border:
                            "1px solid #252631",
                          borderRadius:
                            "12px",
                          marginTop:
                            "10px",
                        }}
                      >

                        <strong
                          style={{
                            color:
                              "white",
                          }}
                        >
                          {coin.name}
                        </strong>

                        <span
                          className={
                            coin.change >=
                            0
                              ? "green"
                              : "red"
                          }
                        >
                          $
                          {formatPrice(
                            coin.price
                          )}
                        </span>

                      </div>
                    );
                  }
                )

              )}

            </section>

          )}

          {/* TAKİP LİSTESİ */}

          {profilePage === "following" && (

            <section
              style={{
                background: "#111219",
                border:
                  "1px solid #272833",
                borderRadius: "24px",
                padding: "40px",
              }}
            >

              <p className="eyebrow">
                TAKİP LİSTESİ
              </p>

              <h1
                style={{
                  color: "white",
                }}
              >
                Takip Listem 📊
              </h1>

              <div
                style={{
                  padding: "35px",
                  marginTop: "25px",
                  textAlign: "center",
                  background:
                    "#181922",
                  border:
                    "1px solid #252631",
                  borderRadius: "15px",
                }}
              >

                <div
                  style={{
                    fontSize: "45px",
                    marginBottom:
                      "15px",
                  }}
                >
                  📊
                </div>

                <h2
                  style={{
                    color: "white",
                  }}
                >
                  Takip ettiğin
                  kimse yok
                </h2>

                <p
                  style={{
                    color: "#777985",
                  }}
                >
                  Şu anda takip
                  listende herhangi
                  bir kullanıcı
                  bulunmuyor.
                </p>

              </div>

            </section>

          )}

          {/* AYARLAR */}

          {profilePage === "settings" && (

            <section
              style={{
                background: "#111219",
                border:
                  "1px solid #272833",
                borderRadius: "24px",
                padding: "40px",
              }}
            >

              <p className="eyebrow">
                AYARLAR
              </p>

              <h1
                style={{
                  color: "white",
                }}
              >
                Ayarlar ⚙️
              </h1>

              <div
                style={{
                  marginTop: "30px",
                }}
              >

                {/* TEMA */}

                <div
                  style={{
                    padding: "20px",
                    background:
                      "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "14px",
                    marginBottom:
                      "12px",
                  }}
                >

                  <strong
                    style={{
                      color: "white",
                    }}
                  >
                    🎨 Görünüm
                  </strong>

                  <p
                    style={{
                      color: "#777985",
                      fontSize: "13px",
                    }}
                  >
                    Uygulamanın
                    görünümünü seç.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap:
                        "wrap",
                      marginTop:
                        "15px",
                    }}
                  >

                    <button
                      onClick={() =>
                        setTheme("dark")
                      }
                      style={{
                        padding:
                          "10px 16px",
                        borderRadius:
                          "10px",
                        border:
                          theme ===
                          "dark"
                            ? "2px solid #8c78ff"
                            : "1px solid #30313b",
                        background:
                          theme ===
                          "dark"
                            ? "#252039"
                            : "#12131a",
                        color:
                          "white",
                        cursor:
                          "pointer",
                      }}
                    >
                      🌙 Koyu
                    </button>

                    <button
                      onClick={() =>
                        setTheme("light")
                      }
                      style={{
                        padding:
                          "10px 16px",
                        borderRadius:
                          "10px",
                        border:
                          theme ===
                          "light"
                            ? "2px solid #8c78ff"
                            : "1px solid #30313b",
                        background:
                          theme ===
                          "light"
                            ? "#e8e4ff"
                            : "#12131a",
                        color:
                          theme ===
                          "light"
                            ? "#222"
                            : "white",
                        cursor:
                          "pointer",
                      }}
                    >
                      ☀️ Açık
                    </button>

                    <button
                      onClick={() =>
                        setTheme("system")
                      }
                      style={{
                        padding:
                          "10px 16px",
                        borderRadius:
                          "10px",
                        border:
                          theme ===
                          "system"
                            ? "2px solid #8c78ff"
                            : "1px solid #30313b",
                        background:
                          theme ===
                          "system"
                            ? "#252039"
                            : "#12131a",
                        color:
                          "white",
                        cursor:
                          "pointer",
                      }}
                    >
                      💻 Cihaz Ayarı
                    </button>

                  </div>

                </div>

                {/* BİLDİRİMLER */}

                <div
                  style={{
                    padding: "20px",
                    background:
                      "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "14px",
                    marginBottom:
                      "12px",
                  }}
                >

                  <strong
                    style={{
                      color: "white",
                    }}
                  >
                    🔔 Bildirimler
                  </strong>

                  <p
                    style={{
                      color: "#777985",
                      fontSize: "13px",
                    }}
                  >
                    Fiyat değişiklikleri
                    ve piyasa
                    bildirimleri.
                  </p>

                </div>

                {/* UYGULAMA */}

                <div
                  style={{
                    padding: "20px",
                    background:
                      "#181922",
                    border:
                      "1px solid #252631",
                    borderRadius: "14px",
                  }}
                >

                  <strong
                    style={{
                      color: "white",
                    }}
                  >
                    🚀 Uygulama
                  </strong>

                  <p
                    style={{
                      color: "#777985",
                      fontSize: "13px",
                    }}
                  >
                    NexCoin • 2026
                  </p>

                </div>

              </div>

            </section>

          )}

        </main>

      )}

    </div>
  );
}

export default App;