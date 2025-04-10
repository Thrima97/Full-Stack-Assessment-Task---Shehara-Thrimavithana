<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>403 - Unauthorized</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #1f2937;
        }

        .container {
            text-align: center;
        }

        h1 {
            font-size: 5rem;
            color: #ef4444;
            margin-bottom: 0.5rem;
        }

        p {
            font-size: 1.25rem;
        }

        a {
            margin-top: 1.5rem;
            display: inline-block;
            color: #3b82f6;
            text-decoration: none;
            font-weight: bold;
        }

        a:hover {
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>403</h1>
        <p>Oops! You are not authorized to access this page.</p>
        <a href="{{ route('home') }}">Go to Home</a>
    </div>
</body>

</html>
