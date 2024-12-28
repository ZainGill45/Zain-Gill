<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <html data-theme="light">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="./images/icons/favicon.ico">
    <meta name="color-scheme" content="light dark" />
    <link rel="stylesheet" href="./css/framework.css">
    <link rel="stylesheet" href="./css/styles.css">
    <title>Home</title>
    <style>
        main {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        form {
            display: flex;
            flex-direction: column;
            width: 512px;
        }

        form button {
            width: 150px;
            margin-inline: auto;
        }
    </style>
</head>

<body>
    <main>
        <h1>Sign In</h1>
        <form>
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Sign In</button>
        </form>
    </main>
</body>

</html>