console.log("Hello via Bun!");

const i18n = {
    init
}

export default i18n

/**
 * @param {Object} options
 * @param {Boolean} adminMode Allows translating elements
 */
function init({ adminMode, ...options } = {
    adminMode: false
}) {

    let adminPane = null

    if (adminMode) {
        console.info('i18n admin enabled')
        adminPane = addI18nPanel()
    }

    if (adminMode) {
        console.log('i18n checking')
        let onInputChange:Function|null = null
        window.setInterval(() => {
            let elements = Array.from(document.querySelectorAll('[data-i18n-key]'));
            elements = elements.filter(el => !el.dataset.i18nBinded)
            elements.forEach(el => {
                el.dataset.i18nBinded = true
                el.addEventListener('dblclick', function () {
                    if(!adminPane){
                        console.warn('i18n admin panel not found')
                        return
                    }
                    
                    adminPane?.show()
                    adminPane?.setTitle(`Editing ${el.dataset.i18nKey}`)
                    adminPane.setI18nKey(el.dataset.i18nKey)
                    adminPane.getInputEl().value = el.textContent

                    let input = adminPane?.getInputEl()
                    if (!!onInputChange) {
                        input.removeEventListener('keyup', onInputChange)
                    }
                    onInputChange = () => {
                        el.textContent = input.value
                    }
                    input.addEventListener('keyup', onInputChange)
                    input.focus()


                });
                el.style.userSelect = 'none';
            })
        }, 1000)
    }
}

async function saveI18nString(key, value, serverURL){
    console.log({
        key,value,serverURL
    })
    const url = new URL(serverURL);
    url.searchParams.append('key', key);
    url.searchParams.append('value', value);

    try {
        const response = await fetch(url.toString());
        return response.json();
    } catch (error) {
        console.error('Error saving i18n string:', error);
    }
}

/**
 * Should add an i18n pane in the viewport middle right
 * width: 250px
 * height: 250px with vertical scroll support
 * hidden by default
 * 
 * the panel should contain:
 *  an h1 (title)
 *  an input to edit i18n string
 * 
 * should return an object with methods:
 * - show: show the panel
 * - hide: hide the panel
 * - setTitle: set h1 title text
 * - getInputEl
 * 
 * how it works:
 * - clicking on the overlay should hide the pane
 * 
 * styles:
 *  - panel body color: white
 *  - panel border: smooth radius
 *  - panel padding: add some space around content
 *  - when the panel is shown: add an overlay to the rest of the page, below the panel
 */
function addI18nPanel() {
    const i18nPanel = document.createElement('div');
    i18nPanel.style.position = 'fixed';
    i18nPanel.style.top = 'calc(50% - 125px)';
    i18nPanel.style.right = '10px';
    i18nPanel.style.minWidth = '250px';
    i18nPanel.style.maxWidth = 'calc(50w)';
    i18nPanel.style.height = '250px';
    i18nPanel.style.overflowY = 'auto';
    i18nPanel.style.backgroundColor = 'white';
    i18nPanel.style.borderRadius = '10px';
    i18nPanel.style.padding = '10px';
    i18nPanel.style.display = 'none';
    document.body.appendChild(i18nPanel);

    const title = document.createElement('h1');
    i18nPanel.appendChild(title);

    let i18nKey = ''
    const input = document.createElement('input'); // Creating input element
    input.type = 'text'
    //input.style.display='none'
    i18nPanel.appendChild(input); // Appending input element to panel

    const setUrlButton = document.createElement('button')
    setUrlButton.textContent='Set Server URL'
    setUrlButton.style.display= "block"
    i18nPanel.appendChild(setUrlButton)

    let serverURL = "http://localhost:5000"
    let getServerURL = ()=> serverURL
    setUrlButton.addEventListener('click',()=>{
        let url = window.prompt('Enter i18n server URL','http://localhost:5000')
        if(url){
            input.style.display='block'
            serverURL=url
        }
    })

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);

    // Function to handle overlay click to hide the panel
    overlay.addEventListener('click', function () {
        i18nPanel.style.display = 'none';
        overlay.style.display = 'none';
    });

    let scope = {
        show: function () {
            overlay.style.zIndex = '1';
            i18nPanel.style.zIndex = '2';
            i18nPanel.style.display = 'block';
            overlay.style.display = 'block';
        },
        hide: function () {
            i18nPanel.style.display = 'none';
            overlay.style.display = 'none';
        },
        setTitle: function (text) {
            title.textContent = text;
        },
        getInputEl: function () {
            return input;
        },
        setUrlButton,
        getServerURL,
        setI18nKey: (key:string) => i18nKey = key
    };

    input.addEventListener('keypress', (event) => {
        // Check if the pressed key is Enter (keyCode 13)
        if (event.key === 'Enter') {

            saveI18nString(i18nKey, input.value, serverURL)

            scope.hide();
        }
    });

    return scope
}

