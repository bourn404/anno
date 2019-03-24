<!doctype html>
<html lang="en" class="">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Anno</title>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
    <link rel="stylesheet" href="assets/stylesheets/compiled/main.css">
</head>
<body>

    <nav class="navbar is-primary is-fixed-top" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item is-size-4" href="/">ANNO</a>

        <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample2">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        </a>
    </div>

    <div id="navbarBasicExample2" class="navbar-menu">
        <div class="navbar-start">
        <a class="navbar-item">
            Import Text
        </a>
        <a class="navbar-item">
            Save Annotations
        </a>
        </div>

        <div class="navbar-end">
        <div class="navbar-item">
            <div class="buttons">
            <a class="button is-primary">
                <strong>Sign up</strong>
            </a>
            <a class="button is-light">
                Log in
            </a>
            </div>
        </div>
        </div>
    </div>
    </nav>
    <div id="content-wrapper">
        <div id="annotatable" class="content">
            <?php include('content.php'); ?>
        </div>
        <!-- <div id="annotations" class="content">
            <span id="testSpan2">consectetuer adipiscing elit.</span>
        </div> -->
    </div>
    <div id="bottom-menu" class="menu">
        <div class="columns is-mobile has-text-centered">
            <div data-action="mark" class="column bottom-btn tab">
                <span class="icon"><i class="fas fa-highlighter"></i></span>
                <p>Mark</p>
            </div>
            <div data-action="note" class="column bottom-btn tab">
                <span class="icon"><i class="fas fa-sticky-note"></i></span>
                <p>Note</p>
            </div>
            <div data-action="tag" class="column bottom-btn tab">
                <span class="icon"><i class="fas fa-tags"></i></span>
                <p>Tag</p>
            </div>
            <div data-action="copy" class="column bottom-btn tab">
                <span class="icon"><i class="fas fa-copy"></i></span>
                <p>Copy</p>
            </div>
            <div data-action="delete" class="column bottom-btn tab">
                <span class="icon"><i class="fas fa-times"></i></span>
                <p>Del</p>
            </div>
        </div>
    </div>
    <div id="action-menu" class="menu columns is-mobile has-text-centered is-multiline">
        <div class="content column is-12 columns is-multiline is-mobile"></div>
    </div>

    <script src="assets/js/core.js" type="module"></script>
    <!-- <script src="assets/js/annotController.js" type="module"></script> -->

</body>
</html>