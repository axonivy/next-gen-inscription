package com.axonivy.nextgen.inscription.server.protocol;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import com.axonivy.nextgen.common.DisposableCollection;
import com.axonivy.nextgen.inscription.server.protocol.model.CallData;
import com.axonivy.nextgen.inscription.server.protocol.model.Document;
import com.axonivy.nextgen.inscription.server.protocol.model.Mapping;
import com.axonivy.nextgen.inscription.server.protocol.model.MappingData;
import com.axonivy.nextgen.inscription.server.protocol.model.NameData;
import com.axonivy.nextgen.inscription.server.protocol.model.UserDialogData;

public class DefaultInscriptionServer extends DisposableCollection implements InscriptionServer {

	private static final UserDialogData EXAMPLE_DIALOG = new UserDialogData(
			new NameData("Name", "Description",
					List.of(new Document("Doc 1", "axonivy.com"), new Document("ivyTeam ❤️", "ivyteam.ch")),
					List.of("bla", "zag")),
			new CallData("", "",
					new MappingData(
							List.of(new Mapping("param", "<ProcurementRequest>", "",
									List.of(new Mapping("procurementRequest", "ProcurementRequest", "in",
											List.of(new Mapping("accepted", "Boolean", "", List.of()),
													new Mapping("amount", "Number", "", List.of())))))),
							"ivy.log.info(\"Hello World\")")));

	@Override
	public void connect(InscriptionClient client) {
		ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
		executorService.scheduleAtFixedRate(() -> updateClient(client), 10, 10, TimeUnit.SECONDS);
		this.addToDispose(() -> executorService.shutdown());
	}

	private void updateClient(InscriptionClient client) {
		UserDialogData data = new UserDialogData(EXAMPLE_DIALOG);
		data.getNameData().setDescription("Updated on " + Long.toString(System.currentTimeMillis()));
		data.getNameData().getTags().add("update");
		client.userDialogChanged(data);
	}

	@Override
	public CompletableFuture<Boolean> initialize() {
		return CompletableFuture.completedFuture(true);
	}

	@Override
	public CompletableFuture<UserDialogData> userDialog(UserDialogParams params) {
		return CompletableFuture.supplyAsync(() -> supplyUserDialog(params));
	}

	protected UserDialogData supplyUserDialog(UserDialogParams params) {
		UserDialogData data = new UserDialogData(EXAMPLE_DIALOG);
		data.getNameData().setDisplayName(params.getDialogId() % 2 == 0 ? "Even Name" : "Odd Name");
		return data;
	}
}
