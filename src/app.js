import {Auth, getUser} from './auth.js';
import { getUserFragments, getFragmentData, postUserFragment, updateUserFragment, deleteUserFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const fragmentForm = document.querySelector("#fragmentForm");
  const getAllFragments = document.querySelector("#getAllFragments");
  const fragmentsTable = document.querySelector("#fragmentsTable");
  const fragmentDataForm = document.querySelector("#fragmentDataForm");
  const newFragment = document.querySelector("#newFragment");
  let data;

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    // Do an authenticated request to the fragments API server and log the result
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
  // Do an authenticated request to the fragments API server and log the result
  try {
    data = await getUserFragments(user);
    console.log(data);
  } catch (err) {
    console.error(`Error getting user fragments: ${err}`);
  }

  getAllFragments.addEventListener("click", function (event) {
    event.preventDefault();
    const tbody = fragmentsTable.querySelector('tbody');
    tbody.innerHTML = '';

    console.log(data);

    if (data) {
      data.fragments.forEach((fragment) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${fragment.id}</td>
          <td>${fragment.ownerId}</td>
          <td>${fragment.created}</td>
          <td>${fragment.updated}</td>
          <td>${fragment.type}</td>
          <td>${fragment.size}</td>
        `;
        tbody.appendChild(row);
      });
      fragmentsTable.style.display = 'table';
    }
  });

  try {
    fragmentForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const fragmentValue = document.getElementById("fragment").value;
      const fragmentType = document.getElementById("selectBox").value;
      console.log(
        `Fragment Value: ${fragmentValue}, Fragment Type: ${fragmentType}`
      );
      if (fragmentType.includes("image")) {
        console.log("image is selected");
        const fragmentImage = document.getElementById("fragmentImage").files[0];
        console.log(fragmentImage);
        await postUserFragment(user, fragmentImage, fragmentType);
      } else {
        await postUserFragment(user, fragmentValue, fragmentType);
      }
    });
  } catch (err) {
    console.error(`Error posting user fragment: ${err}`);
  }

  try {
    fragmentDataForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const fragmentId = document.getElementById("fragmentId").value;
      const operation = document.querySelector('input[name="operation"]:checked').value;
      const ext = document.getElementById("conversionSelectBox").value;
      const newFrag = document.getElementById('newFragment').value;
      document.body.innerHTML = '';

      if (operation == "getData") {
        const data = await getFragmentData(user, fragmentId);
        console.log(data);
        document.body.appendChild(data);

      } else if (operation == "convertData") {
        console.log('Inside convert fragment data');
        console.log(ext);
        const data = await getFragmentData(user, fragmentId, ext);

        console.log(data);
        document.body.appendChild(data);
    
      } else if (operation == "updateData") {
        console.log("Inside Update Fragment Data");

        const data = await updateUserFragment(user, newFrag, fragmentId);
        document.body.appendChild(data);
      } else if (operation == "deleteData") {
        console.log("Inside Delete Fragment Data");
        await deleteUserFragment(user, fragmentId);
      }
    });
  } catch (err) {
    console.error(err, 'error with fragment data');
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);