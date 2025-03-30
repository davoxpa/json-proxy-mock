# Pannello di Amministrazione

La pagina [/admin](admin) contiene il pannello di amministrazione, dove è possibile:

- Gestire i **mocks**
- Visualizzare i **logs**

---

## Utilizzo di Proxy-Mock

Per utilizzare il **proxy-mock** basta aggiungere il prefisso `/proxy` all'indirizzo del server.

### Esempio

Supponiamo di avere:
- **Server:** `http://localhost:3000`
- **API reale:** `https://localhost:4000/api/v1/users`

Per chiamare l'API tramite il proxy, utilizza il seguente URL:
```plaintext
http://localhost:3000/proxy/https://localhost:4000/api/v1/users
